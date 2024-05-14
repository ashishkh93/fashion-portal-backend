const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { User, Order, OrderFinancialInfo, ArtOrder, Art, Service, Category, CustomerInfo } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getApprovedArtist } = require('../artist-services/artist.service');
const { convertDateBasedOnTZ } = require('../../utils/moment.util');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const { cancelPendingOrderSchedule } = require('../../schedules/pending-order-cancel-schedule');
const { checkIsRefundEligible } = require('../../utils/common.util');

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
      attributes: [], // This excludes all attributes from the join table
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
    return order;
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
    const existOrder = await Order.findOne({ where: { customerId, artistId, status: 'pending' } });
    if (existOrder) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'You have already initiated order request for this artist, please be patient untill he/she accept the current order!'
      );
    } else {
      const allArts = await Art.findAll({
        where: {
          id: {
            [Op.in]: body.artIds,
          },
        },
      });

      // get totalAmount and advanceAmountForOrder from Art model
      const { totalAmount, advanceAmountForOrder } = allArts?.reduce(
        (acc, art) => {
          return {
            totalAmount: acc.totalAmount + Number(art.price),
            advanceAmountForOrder: acc.advanceAmountForOrder + Number(art.advanceAmount),
          };
        },
        { totalAmount: 0, advanceAmountForOrder: 0 }
      );

      const orderInitiateBody = { ...body, customerId, artistId };
      let tmpOrder = await Order.create(orderInitiateBody);

      const orderId = tmpOrder.dataValues.id;
      const orderFinancialInfoBody = { orderId, totalAmount, advanceAmountForOrder };

      await OrderFinancialInfo.create(orderFinancialInfoBody);

      const artOrderEntries = body?.artIds?.map((artId) => ({
        artOrderId: orderId,
        artId,
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
    ...order.dataValues,
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
  const order = await getOrderById({ id: orderId, customerId });
  const userCanCancleOrder = order.status === 'pending' || order.status === 'approved';
  const advancedPaid = order.status === 'approved' && order.advanceAmountPaid;

  if (order.status === 'cancelled_by_artist' || order.status === 'cancelled_by_customer' || order.status === 'rejected') {
    const msg =
      order.status === 'cancelled_by_artist' ? 'Order already cancelled by artist' : 'You have already cancelled this order';

    throw new ApiError(httpStatus.FORBIDDEN, msg);
  } else if (order.status === 'completed') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You cannot cancel this order, it is already completed');
  } else if (userCanCancleOrder) {
    const cancelOrderBody = {
      status: body.status,
      customerOrderNote: body.cancelReason,
    };
    await Order.update(cancelOrderBody, { where: { id: orderId, customerId } });
  }

  if (advancedPaid) {
    const isRefundEligible = checkIsRefundEligible(order);
    if (isRefundEligible) {
      /**
       * Refund the order advance amount to customer based on the cancel policy
       */
    }
  }
};

module.exports = {
  orderInitiateService,
  fetchOrderService,
  fetchOrdersService,
  cancelOrderByUserService,
};
