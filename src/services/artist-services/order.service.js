const httpStatus = require('http-status');
const moment = require('moment');
const { Order, Art, Service, Category, User, CustomerInfo } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const { convertDateBasedOnTZ } = require('../../utils/moment.util');

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
];

/**
 * Get all orders
 * @param {string} artistId
 * @param {number} page
 * @param {number} size
 * @returns {Order}
 */
const getAllOrderForArtistService = async (artistId, page, size) => {
  const orderCondition = { artistId };
  const mainModelAttributes = { exclude: ['artIds'] };

  const artistOrders = await getPaginationDataFromModel(
    Order,
    orderCondition,
    page,
    size,
    includeModelForOrderFetch,
    mainModelAttributes
  );

  const updatedOrderItemsWithCurTZ = artistOrders?.items?.map((order) => {
    return {
      ...order.dataValues,
      createdAt: convertDateBasedOnTZ(order.createdAt),
      updatedAt: convertDateBasedOnTZ(order.updatedAt),
    };
  });

  return { ...artistOrders, items: updatedOrderItemsWithCurTZ };
};

/**
 * Get single order
 * @param {string} artistId
 * @param {string} orderId
 * @returns {Order}
 */
const getSingleOrderService = async (artistId, orderId) => {
  const orderCondition = { id: orderId, artistId };

  const singleOrder = await Order.findOne({
    where: [orderCondition],
    attributes: { exclude: ['artIds'] },
    include: includeModelForOrderFetch,
  });
  if (singleOrder) {
    const order = {
      ...singleOrder.dataValues,
      createdAt: convertDateBasedOnTZ(singleOrder.dataValues.createdAt),
      updatedAt: convertDateBasedOnTZ(singleOrder.dataValues.updatedAt),
    };
    return order;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order not found, please provide valid orderId');
  }
};

/**
 * Update order status
 * @param {string} artistId
 * @param {string} orderId
 * @param {object} body
 * @returns {Order}
 */
const updateOrderStatusService = async (artistId, orderId, body) => {
  const orderCondition = { id: orderId, artistId };

  const curOrder = await Order.findByPk(orderId);
  if (curOrder) {
    await Order.update(body, { where: orderCondition });
    /**
     * send the notification to user here (Your order is confirmed or rejected)
     */
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order not found, please provide valid orderId to update the status');
  }
};

module.exports = {
  getAllOrderForArtistService,
  getSingleOrderService,
  updateOrderStatusService,
};
