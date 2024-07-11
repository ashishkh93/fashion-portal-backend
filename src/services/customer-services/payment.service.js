const httpStatus = require('http-status');
const uuid = require('uuid');
const { User, Order, OrderFinancialInfo } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { CashfreeUtil } = require('../../utils/cashfree.util');
const logger = require('../../config/logger');
const config = require('../../config/config');
const { getPlainData } = require('../../utils/common.util');

const xAPiVersion = config.cashfree.apiVersion;

/**
 * Get order by id
 * @param {string} orderId
 */
const getOrderById = async (orderId) => {
  const order = await Order.findOne({
    where: { id: orderId },
    attributes: ['status'],
    include: [
      {
        model: OrderFinancialInfo,
        as: 'orderFinancialInfo',
        attributes: ['totalAmount', 'advanceAmountForOrder', 'advanceAmountPaid', 'discount', 'addOnAmount'],
      },
    ],
  });
  if (order) {
    const {
      dataValues: { status },
    } = order;

    if (status === 'APPROVED') {
      return getPlainData(order);
    } else if (status === 'COMPLETED') {
      throw new ApiError(httpStatus.FORBIDDEN, 'Your order has already completed');
    } else if (status.includes('CANCELLED')) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Your order is already cancelled');
    } else {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Artist has not been accepted your order yet, please wait until order accepted'
      );
    }
  } else {
    throw new ApiError(httpStatus.FORBIDDEN, 'Order not found');
  }
};

/**
 * Payment Initiate service (createOrder in Cashfree)
 * @param {string} customerId
 * @param {string} orderId
 * @param {object} body
 * @param {User} customer
 * @returns {object}
 */
const paymentInitiateService = async (customerId, orderId, body, customer) => {
  const orderById = await getOrderById(orderId);
  const orderFinancialInfo = orderById.orderFinancialInfo;

  if (body?.isAdvance && orderFinancialInfo?.advanceAmountForOrder === 0) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You cannot create a advance payment for this order, because artist is not asking for it.'
    );
  }

  /**
   * if user doesn't paid an advance amount for the order, then he should not able to make final payment (for version 1 we are considering this flow)
   */

  if (!body?.isAdvance && orderFinancialInfo?.advanceAmountForOrder > 0 && !orderFinancialInfo?.advanceAmountPaid) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You have not paid advance amount for this order yet, please pay advance first'
    );
  }

  const pgOrderId = body?.isAdvance ? `ADVANCE_${orderId}` : `FINAL_${orderId}`;
  const totalAmount = orderFinancialInfo.totalAmount;
  const addOnAmount = orderFinancialInfo.addOnAmount;
  const advanceAmountForOrder = orderFinancialInfo.advanceAmountForOrder;
  const discount = orderFinancialInfo.discount;

  const finalTotalAmount = totalAmount + addOnAmount - advanceAmountForOrder - discount;

  // set order amount based on payment type (advance or final)
  const orderAmount = body?.isAdvance ? advanceAmountForOrder : finalTotalAmount;

  let requestInitBody = {
    order_amount: orderAmount,
    order_currency: 'INR',
    order_id: pgOrderId,
    customer_details: {
      customer_id: customerId,
      customer_phone: customer.phone,
      customer_order_id: orderId,
    },
    // order_meta: {
    //   // use only for development
    //   return_url: `https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id=${pgOrderId}`,
    // },
    order_note: body?.isAdvance ? 'Advance Amount Order' : 'Final Amount Order',
  };

  try {
    const createOrder = await CashfreeUtil.PGCreateOrder(xAPiVersion, requestInitBody);
    return createOrder.data;
  } catch (error) {
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.response.data.message || 'Internal Server Error'
    );
  }
};

/**
 * Verify Payment with Cashree SDK
 * To check the payment if it succeed or failed or cancelled and return the response based on it
 * @param {string} cfOrderId
 * @returns {object}
 */
const paymentVerifyService = async (cfOrderId) => {
  try {
    const payment = await CashfreeUtil.PGOrderFetchPayments(xAPiVersion, cfOrderId);

    if (payment?.data?.length > 0) {
      const succeedPayment = payment?.data?.find((p) => p.payment_status === 'SUCCESS');
      const cancelledPayment = payment?.data?.find((p) => p.payment_status === 'CANCELLED');
      const failedPayment = payment?.data?.find((p) => p.payment_status === 'FAILED');

      if (!!succeedPayment) {
        const { order_id, payment_amount, payment_currency, payment_method, payment_status } = succeedPayment;

        return { order_id, payment_amount, payment_currency, payment_method, payment_status };
      } else if (!!cancelledPayment || !!failedPayment) {
        const msg = cancelledPayment
          ? 'Payment cancelled by user'
          : failedPayment
          ? 'Payment failed'
          : 'Internal server error';

        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, msg);
      }
    } else {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'No payment found for this order');
    }
  } catch (error) {
    // logger.error(error);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error?.response?.data?.message || error.message || 'Internal server error'
    );
  }
};

/**
 * Payment Verify with Cashree sdk
 * @param {string} orderId
 * @returns {object}
 */
const fetchPaymentOrderService = async (orderId) => {
  try {
    const paymentOrder = await CashfreeUtil.PGFetchOrder(xAPiVersion, orderId);
    return paymentOrder.data;
  } catch (error) {
    logger.error(error);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.response.data.message || 'Internal server error'
    );
  }
};

/**
 * Get single payment reference from cashfree order id to check the indivdual payment's status
 * @param {string} orderId
 * @returns {object}
 */
const getSinglePaymentRefByCFOrderIdService = async (cfOrderId, cfPaymentId) => {
  try {
    const payment = await CashfreeUtil.PGOrderFetchPayment(xAPiVersion, cfOrderId, cfPaymentId);
    return payment.data;
  } catch (error) {
    logger.error(error);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.response.data.message || 'Internal server error'
    );
  }
};

module.exports = {
  paymentInitiateService,
  paymentVerifyService,
  fetchPaymentOrderService,
  getSinglePaymentRefByCFOrderIdService,
};
