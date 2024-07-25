const { scheduleJob } = require('node-schedule');
const moment = require('moment');
const { Order, OrderFinancialInfo } = require('../models');
const logger = require('../config/logger');
const { getCancellationHoursForPendingOrder, getPlainData } = require('../utils/common.util');

/**
 * Schedule job for the orders, which has still the pending status after 24 hours of order creation
 */

const cancelPendingOrder = async (order) => {
  const orderId = order.id;
  try {
    if (order.status === 'PENDING') {
      logger.info(`Cancel order schedule started for orderId: ${orderId}, due to pending status`);
      const orderUpdateBody = { status: 'NOT_RESPONDED' };
      await Order.update(orderUpdateBody, { where: { id: orderId } });
    } else {
      logger.info(`Order status already updated for orderId: {orderId: ${orderId}} {status: ${order.status}}`);
    }
  } catch (error) {
    logger.error(`Cancel pending order job failed for orderId: ${orderId} with error: ${error.message}`);
  }
};

/**
 * Schedule job for the orders, which has still not paid advance amount in timely manner
 */
const cancelApprovedOrder = async (order) => {
  const orderId = order.id;
  try {
    if (
      order.status === 'APPROVED' &&
      order.orderFinancialInfo.advanceAmountForOrder > 0 &&
      !order.orderFinancialInfo.advanceAmountPaid
    ) {
      logger.info(
        `Cancel approved order schedule started for orderId: ${orderId}, due to not paid advance amount in timely manner`
      );
      const orderUpdateBody = { status: 'AUTO_CANCELLED_DUE_TO_UNPAID_ADVANCE_AMOUNT' };
      await Order.update(orderUpdateBody, { where: { id: orderId } });
    } else {
      logger.info(
        `Order status already updated for orderId: {orderId: ${orderId}} {status: ${order.status}}, advance amount is: ${order.orderFinancialInfo.advanceAmountForOrder} `
      );
    }
  } catch (error) {
    logger.error(`Cancel approved order job failed for orderId: ${orderId} with error: ${error.message}`);
  }
};

const start = async (orderId, type) => {
  // moment.tz.setDefault('Asia/Calcutta');
  const singleOrder = await Order.findOne({
    where: { id: orderId },
    include: [
      {
        model: OrderFinancialInfo,
        as: 'orderFinancialInfo',
        attributes: ['advanceAmountForOrder', 'advanceAmountPaid'],
      },
    ],
  });
  if (!!singleOrder) {
    const orderData = getPlainData(singleOrder);
    const dateTimeToConsider = type === 'pendingOrder' ? orderData.createdAt : orderData.approvedAt;

    const callbackToBeCalled = type === 'pendingOrder' ? cancelPendingOrder : cancelApprovedOrder;

    /**
     * get cancellation hours, aftet that auto order schedule should run
     */
    const cancellationHours = getCancellationHoursForPendingOrder(orderData, dateTimeToConsider);

    const cancellationTime = moment().add(cancellationHours, 'hours').toDate();
    // const cancellationTime = new Date(Date.now() + 40 * 1000);
    const job = scheduleJob(cancellationTime, () => callbackToBeCalled(orderData));
    return job;
  }
};

module.exports = { cancelPendingOrderSchedule: start };
