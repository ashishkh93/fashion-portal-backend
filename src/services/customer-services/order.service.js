const httpStatus = require('http-status');
const { Op } = require('sequelize');
const {
  User,
  Order,
  OrderFinancialInfo,
  ArtOrder,
  Art,
  Service,
  Category,
  Review,
  ArtistInfo,
  Sequelize,
} = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getApprovedArtist } = require('../artist-services/artist.service');
const { convertDateBasedOnTZ } = require('../../utils/moment.util');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const { cancelPendingOrderSchedule } = require('../../schedules/pending-order-cancel-schedule');
const { checkIsRefundEligible, getPlainData, getOrderIdentity, artistIsOnVacation } = require('../../utils/common.util');
const { getOrderWithFinancialInfoService } = require('../artist-services/order.service');
const { createRefunRequestForOrderService } = require('../superadmin-services/refund.service');
const { getTransaction } = require('../../middlewares/asyncHooks');
const { sendNewOrderRequestNotification } = require('../../handlers/notifications/notification-data.hanlder');

const getAverageRatingForArtistInOrderQuery = () => {
  return '(SELECT AVG("reviewCount") FROM "Review" WHERE "Review"."artistId" = "artistId")';
};

/**
 * Get single order by id
 * @param {string} orderId
 * @param {string} customerId
 */
const getOrderById = async (orderCondition) => {
  const orderAttributes = [
    'id',
    'artistId',
    'orderIdentity',
    'status',
    'date',
    'time',
    'customerOrderNote',
    'artistOrderNote',
    'approvedAt',
    'createdAt',
    'updatedAt',
    [Sequelize.literal(getAverageRatingForArtistInOrderQuery()), 'averageRating'],
  ];

  const includeForSingleOrder = [
    {
      model: OrderFinancialInfo,
      as: 'orderFinancialInfo',
      attributes: { exclude: ['id', 'paidToArtist', 'isRefunded'] },
    },
    {
      model: Art,
      as: 'arts',
      attributes: ['price', 'advanceAmount', 'timeToCompleteInMinutes', 'coverImage', 'name', 'images', 'description'],
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['name'],
          required: true,
        },
        {
          model: Category,
          as: 'category',
          attributes: ['name'],
          required: true,
        },
      ],
      through: {
        attributes: ['quantity'],
      },
    },
    {
      model: ArtistInfo,
      as: 'orderArtist',
      attributes: ['profilePic', 'fullName', 'location'],
      required: true,
      include: [
        {
          model: User,
          as: 'artist',
          attributes: ['id', 'phone'],
          required: true,
        },
        {
          model: Review,
          as: 'artistReview',
          attributes: [],
          required: true,
        },
      ],
    },
    {
      model: Review,
      as: 'orderReview',
      attributes: ['reviewCount', 'description'],
      required: false,
    },
  ];

  const order = await Order.findOne({
    where: orderCondition,
    attributes: orderAttributes,
    include: includeForSingleOrder,
  });
  if (order) {
    return getPlainData(order);
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found, please provide valid order id');
  }
};

/**
 * Order Initiate service
 * @param {string} customerId
 * @param {string} artistId
 * @param {object} body
 * @param {User} customer
 * @returns {object}
 */
const orderInitiateService = async (customerId, artistId, body, customer) => {
  const transaction = getTransaction();
  const artist = await getApprovedArtist(artistId);
  const vacations = artist.artistInfos.vacations;

  const artistIsonVacation = vacations?.length && artistIsOnVacation(body.date, vacations);

  if (artist.phone === customer.phone) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot create an order for your self');
  } else if (artistIsonVacation) {
    throw new ApiError(httpStatus.FORBIDDEN, 'The artist is on vacation on the selected booking date');
  } else {
    const existOrder = await Order.findOne({ where: { customerId, artistId, status: 'PENDING' } });
    if (existOrder) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'You have already initiated order request for this artist, please be patient untill he/she accept the current order!'
      );
    } else {
      const artIds = body.arts?.map((art) => art.id);
      const orderCount = await Order.count(); // get total orders count

      /**
       * Generate unique identity for each order
       */
      const orderIdentity = getOrderIdentity(body.servicePrefix, orderCount);

      const allArts = await Art.findAll({
        where: {
          id: {
            [Op.in]: artIds,
          },
          artistId,
          status: 'APPROVED',
        },
        raw: true,
      });

      if (!allArts || allArts?.length === 0) {
        throw new ApiError(httpStatus.FORBIDDEN, 'The Artist does not have any services that you choose');
      }

      // get totalAmount and advanceAmountForOrder from Art model
      const { totalAmount, advanceAmountForOrder } = allArts?.reduce(
        (acc, art) => {
          const payloadArt = body.arts.find((a) => a.id === art.id);
          return {
            totalAmount: acc.totalAmount + Number(art.price) * Number(payloadArt.qty),
            advanceAmountForOrder: acc.advanceAmountForOrder + Number(art.advanceAmount) * Number(payloadArt.qty),
          };
        },
        { totalAmount: 0, advanceAmountForOrder: 0 }
      );

      const orderInitiateBody = { ...body, orderIdentity, artIds, customerId, artistId };
      let tmpOrder = await Order.create(orderInitiateBody, { transaction });

      const orderId = tmpOrder.dataValues.id;
      const orderFinancialInfoBody = { orderId, totalAmount, advanceAmountForOrder };

      await OrderFinancialInfo.create(orderFinancialInfoBody, { transaction });

      const artOrderEntries = body.arts.map((art) => ({
        artOrderId: orderId,
        artId: art.id,
        quantity: art.qty,
      }));
      await ArtOrder.bulkCreate(artOrderEntries, { transaction });
      const { id, status, createdAt } = tmpOrder.dataValues;

      /**
       * Sending notification to artist about new order request
       */
      sendNewOrderRequestNotification(customerId, artistId, orderId, body.date);

      /**
       * Cancel the order if order status is still pending after 24 hours
       */
      cancelPendingOrderSchedule(id, 'pendingOrder');

      return { id, customerId, artistId, status, createdAt };
    }
  }
};

/**
 * Fetch order for user
 * @param {string} customerId
 * @param {string} orderId
 * @returns {Promise<Order>}
 */
const fetchOrderService = async (orderId) => {
  const order = await getOrderById({ id: orderId });
  return {
    ...order,
    createdAt: convertDateBasedOnTZ(order.createdAt),
    updatedAt: convertDateBasedOnTZ(order.updatedAt),
  };
};

/**
 * Fetch all orders for user
 * @param {string} customerId
 * @param {number} page
 * @param {size} page
 * @returns {Promise<Order>}
 */
const fetchOrdersService = async (customerId, page, size) => {
  const orderCondition = { customerId };
  // const mainModelAttributes = { exclude: ['artIds'] };

  const mainModelAttributes = [
    'id',
    'artistId',
    'customerId',
    'orderIdentity',
    'status',
    'date',
    'time',
    'updatedAt',
    [Sequelize.literal(getAverageRatingForArtistInOrderQuery()), 'averageRating'],
  ];

  const includeForAllOrders = [
    {
      model: Art,
      as: 'arts',
      attributes: ['coverImage'],
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['name'],
          required: false,
        },
      ],
      through: {
        attributes: [],
      },
    },
    {
      model: ArtistInfo,
      as: 'orderArtist',
      attributes: ['artistId', 'profilePic', 'fullName', 'location'],
      required: true,
      include: [
        {
          model: User,
          as: 'artist',
          attributes: [],
          required: true,
        },
      ],
    },
  ];

  const allOrders = await getPaginationDataFromModel(
    Order,
    orderCondition,
    page,
    size,
    includeForAllOrders,
    mainModelAttributes
  );

  const updatedOrderItemsWithCurTZ = allOrders?.items?.map((order) => {
    return {
      ...order.dataValues,
      createdAt: convertDateBasedOnTZ(order.createdAt),
      updatedAt: convertDateBasedOnTZ(order.updatedAt),
    };
  });

  return { ...allOrders, items: updatedOrderItemsWithCurTZ };
};

/**
 * Cancel order by user with reason
 * @param {string} customerId
 * @param {string} orderId
 * @param {object} body
 * @returns {Promise}
 */
const cancelOrderByUserService = async (customerId, orderId, body) => {
  const transaction = getTransaction();
  // const order = await getOrderById({ id: orderId, customerId });
  const order = await getOrderWithFinancialInfoService(orderId);
  const orderFinancialInfo = order.orderFinancialInfo;

  const userCanCancleOrder = order.status === 'PENDING' || order.status === 'APPROVED';
  const advancedPaid = order.status === 'APPROVED' && orderFinancialInfo.advanceAmountPaid;

  if (order.status === 'CANCELLED_BY_ARTIST' || order.status === 'CANCELLED_BY_CUSTOMER' || order.status === 'REJECTED') {
    const msg =
      order.status === 'CANCELLED_BY_ARTIST' ? 'Order already cancelled by artist' : 'You have already cancelled this order';

    throw new ApiError(httpStatus.FORBIDDEN, msg);
  } else if (order.status === 'COMPLETED') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can not cancel this order, it is already completed');
  } else if (userCanCancleOrder) {
    const cancelOrderBody = {
      status: body.status,
      customerOrderNote: body.cancelReason,
    };
    await Order.update(cancelOrderBody, { where: { id: orderId, customerId }, transaction });

    if (advancedPaid) {
      const isRefundEligible = checkIsRefundEligible(orderFinancialInfo);
      if (isRefundEligible) {
        /**
         * Refund the order advance amount to customer based on the cancel policy
         */
        await createRefunRequestForOrderService(order, 'Order Cancelled by User', transaction);
      }
    }
  }
};

module.exports = {
  orderInitiateService,
  fetchOrderService,
  fetchOrdersService,
  cancelOrderByUserService,
};
