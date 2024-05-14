const httpStatus = require('http-status');
const moment = require('moment');
const { Order, OrderFinancialInfo, Art, Service, Category, User, CustomerInfo } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const { convertDateBasedOnTZ } = require('../../utils/moment.util');
const { cancelPendingOrderSchedule } = require('../../schedules/pending-order-cancel-schedule');

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
  const curOrder = await Order.findOne({
    where: {
      id: orderId,
      artistId,
    },
  });
  if (curOrder) {
    if (curOrder.status === 'pending' || curOrder.status === 'approved') {
      const updateOrderBody = { ...body, approvedAt: moment() };
      const orderUpdateCondition = { id: orderId, artistId };

      await Order.update(updateOrderBody, { where: orderUpdateCondition });

      if (body.status === 'cancelled_by_artist' && curOrder.advanceAmountForOrder > 0 && curOrder.advanceAmountPaid) {
        /**
         * Initiate the advance amount refund to user, because artist is cancelling the order and customer has already paid advance amount for an order
         */
      } else if (body.status === 'approved') {
        /**
         * Initiate the auto order cancel schedule if the advance amount is not paid by user within timely manner
         * AND
         * send the notification to user that your order has been approved by artist, and you need to pay advance amount if it is, in timely manner.
         */
        cancelPendingOrderSchedule(orderId, 'approvedOrder');
      } else if (body.status === 'rejected') {
        /**
         * send the notification to user that your order has been rejected by artist due to some reason
         */
      }
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Order status already updated!');
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order not found, please provide valid orderId');
  }
};

/**
 * Add discount in current order
 * @param {string} artistId
 * @param {string} orderId
 * @param {object} body
 * @returns {Order}
 */
const addDiscountAndAddOnInOrderService = async (artistId, orderId, body) => {
  const orderCondition = { orderId };

  // const curOrder = await Order.findByPk(orderId);
  const curOrder = await OrderFinancialInfo.findOne({ where: { orderId } });
  if (curOrder) {
    let updateOrderBody = {};
    if (body.discount) {
      const maxDiscount = curOrder.totalAmount * 0.2;
      if (body.discount > maxDiscount) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Discount can not be more than 20%(Rs.${maxDiscount}) of total amount`);
      } else {
        updateOrderBody.discount = body.discount;
      }
    }

    if (body.addOnAmount) {
      updateOrderBody.addOnAmount = body.addOnAmount;
      updateOrderBody.artistAddOnNote = body?.artistAddOnNote || '';
    }
    await OrderFinancialInfo.update(updateOrderBody, { where: orderCondition });
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order not found, please provide valid orderId to update the current order');
  }
};

module.exports = {
  getAllOrderForArtistService,
  getSingleOrderService,
  updateOrderStatusService,
  addDiscountAndAddOnInOrderService,
};
