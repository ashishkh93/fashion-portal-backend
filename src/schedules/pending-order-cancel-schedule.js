const { scheduleJob } = require('node-schedule');
const moment = require('moment');
const { Order, OrderFinancialInfo, ScheduledJob } = require('../models');
const logger = require('../config/logger');
const { getCancellationHoursForPendingOrder, getPlainData } = require('../utils/common.util');
const { scheduleJobService } = require('../services/common-services');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Schedule job for the orders, which has still the pending status after 24 hours of order creation
 */

const cancelPendingOrder = async (order, scheduledJobId) => {
  const orderId = order.id;
  try {
    if (order.status === 'PENDING') {
      logger.info(`Cancel order schedule started for orderId: ${orderId}, due to pending status`);
      const orderUpdateBody = { status: 'NOT_RESPONDED' };
      await Order.update(orderUpdateBody, { where: { id: orderId } });
      await scheduleJobService.updateSchedule({ status: 'COMPLETED' }, { where: { id: scheduledJobId } });
    } else {
      logger.info(`Order already updated for orderId: ${orderId}, current status: ${order.status}`);
      await scheduleJobService.updateSchedule({ status: 'SKIPPED' }, { where: { id: scheduledJobId } });
    }
  } catch (error) {
    logger.error(`Cancel pending order failed for orderId: ${orderId}, error: ${error.message}`);
    await scheduleJobService.updateSchedule({ status: 'FAILED' }, { where: { id: scheduledJobId } });
  }
};

/**
 * Schedule job for the orders, which has still not paid advance amount in timely manner
 */
const cancelApprovedOrder = async (order, scheduledJobId) => {
  const orderId = order.id;
  try {
    if (
      order.status === 'APPROVED' &&
      order.orderFinancialInfo.advanceAmountForOrder > 0 &&
      !order.orderFinancialInfo.advanceAmountPaid
    ) {
      logger.info(`Cancel approved order started for orderId: ${orderId}, due to unpaid advance`);
      const orderUpdateBody = { status: 'AUTO_CANCELLED_DUE_TO_UNPAID_ADVANCE_AMOUNT' };
      await Order.update(orderUpdateBody, { where: { id: orderId } });
      await scheduleJobService.updateSchedule({ status: 'COMPLETED' }, { where: { id: scheduledJobId } });
    } else {
      logger.info(`Order already updated for orderId: ${orderId}, current status: ${order.status}`);
      await ScheduledJob.update({ status: 'SKIPPED' }, { where: { id: scheduledJobId } });
    }
  } catch (error) {
    logger.error(`Cancel approved order failed for orderId: ${orderId}, error: ${error.message}`);
    await scheduleJobService.updateSchedule({ status: 'FAILED' }, { where: { id: scheduledJobId } });
  }
};

/**
 * Helper function to retry ScheduledJob creation multiple times.
 */
const tryCreateScheduledJob = async (orderId, type, cancellationTime, maxRetries = 3) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const scheduledJob = await scheduleJobService.createSchedule({
        orderId,
        type,
        scheduledTime: cancellationTime,
      });
      return scheduledJob;
    } catch (error) {
      attempt++;
      logger.error(`ScheduledJob create failed. Attempt ${attempt}/${maxRetries} for orderId ${orderId}: ${error.message}`);
      if (attempt >= maxRetries) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Schedule creating failed after max retries.');
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

/**
 * Main function to schedule an order cancellation job.
 */
const start = async (orderId, type) => {
  try {
    const singleOrder = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderFinancialInfo,
          as: 'orderFinancialInfo',
          attributes: ['advanceAmountForOrder', 'advanceAmountPaid'],
        },
      ],
    });

    if (!singleOrder) {
      logger.error(`Order not found for scheduling cancellation. orderId: ${orderId}`);
      return;
    }

    const orderData = getPlainData(singleOrder);
    const dateTimeToConsider = type === 'pendingOrder' ? orderData.createdAt : orderData.approvedAt;
    const cancellationMins = getCancellationHoursForPendingOrder(orderData, dateTimeToConsider);
    const cancellationTime = moment().add(cancellationMins, 'minutes').toDate();

    let scheduledJob;
    try {
      scheduledJob = await tryCreateScheduledJob(orderId, type, cancellationTime);
    } catch (dbError) {
      logger.error(`Failed to create scheduled job after retries for orderId: ${orderId}, error: ${dbError.message}`);
      return;
    }

    // Now actually schedule the job
    try {
      const callbackToBeCalled = type === 'pendingOrder' ? cancelPendingOrder : cancelApprovedOrder;

      scheduleJob(cancellationTime, () => callbackToBeCalled(orderData, scheduledJob.id));
    } catch (scheduleError) {
      logger.error(`Failed to schedule job in memory for orderId: ${orderId}, error: ${scheduleError.message}`);
      await ScheduledJob.update({ status: 'FAILED' }, { where: { id: scheduledJob.id } });
    }
  } catch (error) {
    logger.error(`Unhandled error while scheduling orderId: ${orderId}, error: ${error.message}`);
  }
};

module.exports = { cancelPendingOrderSchedule: start };
