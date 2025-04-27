const httpStatus = require('http-status');
const moment = require('moment');
const {
  Order,
  OrderFinancialInfo,
  Art,
  Service,
  Category,
  User,
  CustomerInfo,
  CustomerAddress,
  Review,
} = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const { convertDateBasedOnTZ } = require('../../utils/moment.util');
const { cancelPendingOrderSchedule } = require('../../schedules/pending-order-cancel-schedule');
const { getPlainData } = require('../../utils/common.util');
const { createRefunRequestForOrderService } = require('../superadmin-services/refund.service');
const { getTransaction } = require('../../middlewares/asyncHooks');

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
      attributes: ['quantity'], // This excludes all attributes from the join table
    },
  },
  {
    model: OrderFinancialInfo,
    as: 'orderFinancialInfo',
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
  },
  {
    model: CustomerInfo,
    as: 'orderCustomer',
    attributes: { exclude: ['id'] },
    include: [
      {
        model: User,
        as: 'customerInfo',
        attributes: ['phone'],
      },
    ],
    // attributes: ['status', 'fullName', 'email', 'gender', 'profilePic'],
  },
  {
    model: CustomerAddress,
    as: 'address',
    attributes: { exclude: ['id', 'customerId', 'deletedAt'] },
  },
  {
    model: Review,
    as: 'orderReview',
    attributes: ['reviewCount', 'description', 'createdAt'],
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
const getSingleOrderService = async (orderId) => {
  const orderCondition = { id: orderId };

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
 * Get order with financialInfo
 * @param {string} artistId
 * @param {string} orderId
 * @returns {Order}
 */
const getOrderWithFinancialInfoService = async (orderId) => {
  const order = await Order.findOne({
    where: {
      id: orderId,
    },
    include: [
      {
        model: OrderFinancialInfo,
        as: 'orderFinancialInfo',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      },
    ],
  });
  if (order) {
    return getPlainData(order);
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
  const transaction = getTransaction();
  const curOrder = await getOrderWithFinancialInfoService(orderId);

  if (curOrder.status === 'PENDING' || curOrder.status === 'APPROVED') {
    let updateOrderBody = { ...body };
    if (body.status === 'APPROVED') {
      updateOrderBody = { ...updateOrderBody, approvedAt: moment() };
    }
    const orderUpdateCondition = { id: orderId, artistId };

    await Order.update(updateOrderBody, { where: orderUpdateCondition, transaction });

    if (
      body.status === 'CANCELLED_BY_ARTIST' &&
      curOrder.orderFinancialInfo.advanceAmountForOrder > 0 &&
      curOrder.orderFinancialInfo.advanceAmountPaid
    ) {
      /**
       * Initiate the advance amount refund to user, because artist is cancelling the order and customer has already paid advance amount for an order
       */

      await createRefunRequestForOrderService(curOrder, 'Order Cancelled by Artist', transaction);
    } else if (body.status === 'APPROVED') {
      /**
       * Initiate the auto order cancel schedule if the advance amount is not paid by user within timely manner
       * AND
       * send the notification to user that your order has been approved by artist, and you need to pay advance amount if it is, in timely manner.
       */
      setTimeout(() => {
        cancelPendingOrderSchedule(orderId, 'approvedOrder');
      }, 100);
    } else if (body.status === 'REJECTED') {
      /**
       * send the notification to user that your order has been rejected by artist due to some reason
       */
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order status already updated!');
  }
};

/**
 * Add discount in current order
 * @param {string} artistId
 * @param {string} orderId
 * @param {object} body
 * @returns {Order}
 */
const addDiscountAndAddOnInOrderService = async (orderId, body) => {
  const existingOrder = await Order.findOne({
    where: { id: orderId, status: 'APPROVED' },
    include: [
      {
        model: OrderFinancialInfo,
        as: 'orderFinancialInfo',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      },
    ],
  });

  if (existingOrder) {
    const curOrder = getPlainData(existingOrder);
    let updateOrderBody = {};
    if (body.discount) {
      const maxDiscount = curOrder.orderFinancialInfo.totalAmount * 0.2;
      if (body.discount > maxDiscount) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Discount can not be more than 20%(Rs.${maxDiscount}) of total amount`);
      } else {
        updateOrderBody.discount = body.discount;
      }
    } else if (body.addOnAmount) {
      updateOrderBody.addOnAmount = body.addOnAmount;
      updateOrderBody.artistAddOnNote = body?.artistAddOnNote || '';
    }

    await OrderFinancialInfo.update(updateOrderBody, { where: { orderId } });
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You can not edit this order, because the order may have been completed!');
  }
};

module.exports = {
  getAllOrderForArtistService,
  getSingleOrderService,
  updateOrderStatusService,
  addDiscountAndAddOnInOrderService,
  getOrderWithFinancialInfoService,
  includeModelForOrderFetch,
};
