const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { User, Order, OrderFinancialInfo, ArtOrder, Art, Service, Category, CustomerInfo } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getApprovedArtist } = require('../artist-services/artist.service');
const { convertDateBasedOnTZ } = require('../../utils/moment.util');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const { cancelPendingOrderSchedule } = require('../../schedules/pending-order-cancel-schedule');
const { checkIsRefundEligible, getPlainData, getOrderIdentity } = require('../../utils/common.util');
const { getOrderWithFinancialInfoService } = require('../artist-services/order.service');
const { createRefunRequestForOrderService } = require('../superadmin-services/refund.service');

const includeModelForOrderFetch = [
  {
    model: Art,
    attributes: { exclude: ['artistId', 'serviceId', 'categoryId', 'updatedAt'] },
    as: 'arts',
    include: [
      {
        model: Service,
        as: 'service',
      },
      {
        model: Category,
        as: 'category',
      },
    ],
    through: {
      attributes: ['quantity'],
    },
  },
  {
    model: User,
    as: 'customer',
    attributes: ['id', 'role', 'phone'],
    include: [
      {
        model: CustomerInfo,
        as: 'customerInfo',
        attributes: { exclude: ['customerId', 'status'] },
      },
    ],
  },
  {
    model: OrderFinancialInfo,
    as: 'orderFinancialInfo',
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
  },
];

/**
 * Get single order by id
 * @param {string} orderId
 * @param {string} customerId
 */
const getOrderById = async (orderCondition) => {
  const order = await Order.findOne({
    where: orderCondition,
    include: includeModelForOrderFetch,
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
  const artist = await getApprovedArtist(artistId);

  if (artist.phone === customer.phone) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot create an order for your self');
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
      let tmpOrder = await Order.create(orderInitiateBody);

      const orderId = tmpOrder.dataValues.id;
      const orderFinancialInfoBody = { orderId, totalAmount, advanceAmountForOrder };

      await OrderFinancialInfo.create(orderFinancialInfoBody);

      const artOrderEntries = body.arts.map((art) => ({
        artOrderId: orderId,
        artId: art.id,
        quantity: art.qty,
      }));
      await ArtOrder.bulkCreate(artOrderEntries);
      const { id, status, createdAt } = tmpOrder.dataValues;

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
const fetchOrderService = async (customerId, orderId) => {
  const order = await getOrderById({ id: orderId, customerId });
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
  const mainModelAttributes = { exclude: ['artIds'] };

  const allOrders = await getPaginationDataFromModel(
    Order,
    orderCondition,
    page,
    size,
    includeModelForOrderFetch,
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
    throw new ApiError(httpStatus.FORBIDDEN, 'You cannot cancel this order, it is already completed');
  } else if (userCanCancleOrder) {
    const cancelOrderBody = {
      status: body.status,
      customerOrderNote: body.cancelReason,
    };
    await Order.update(cancelOrderBody, { where: { id: orderId, customerId } });

    if (advancedPaid) {
      const isRefundEligible = checkIsRefundEligible(orderFinancialInfo);
      if (isRefundEligible) {
        /**
         * Refund the order advance amount to customer based on the cancel policy
         */
        await createRefunRequestForOrderService(order, 'Order Cancelled by User');
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
