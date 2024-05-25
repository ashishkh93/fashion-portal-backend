const httpStatus = require('http-status');
const moment = require('moment');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');
const { Transaction, Order, OrderFinancialInfo } = require('../../models');
const logger = require('../../config/logger');

const webhookTransaction = catchAsync(async (req, res) => {
  // return res.status(httpStatus.CREATED).send({ status: true, message: 'Transaction created', entity: null });
  try {
    const webhookReqBody = req.body.data;

    const cfOrderId = webhookReqBody.order.order_id;
    const isAdvancePayment = cfOrderId.startsWith('ADVANCE');
    const isFinalPayment = cfOrderId.startsWith('FINAL');

    let actualOrderId = '';
    if (isAdvancePayment) {
      const advance = 'ADVANCE_';
      actualOrderId = cfOrderId.substring(advance.length);
    } else if (isFinalPayment) {
      const final = 'FINAL_';
      actualOrderId = cfOrderId.substring(final.length);
    }

    const createTransactionBody = {
      cfOrderId: actualOrderId,
      cfPaymentId: webhookReqBody.payment.cf_payment_id?.toString(),
      userId: webhookReqBody.customer_details.customer_id,
      paymentStatus: webhookReqBody.payment.payment_status,
      paymentAmount: webhookReqBody.payment.payment_amount,
      paymentCurrency: webhookReqBody.payment.payment_currency,
      paymentMethod: webhookReqBody.payment.payment_method,
      paymentType: isAdvancePayment ? 'advance' : 'final',
      details: req.body,
    };
    const newTrn = await Transaction.create(createTransactionBody);
    if (newTrn) {
      if (!!actualOrderId) {
        let orderUpdateBody = {
          transactionId: newTrn.id,
        };
        if (isFinalPayment) {
          orderUpdateBody.status = 'completed';
        }

        await Order.update(orderUpdateBody, { where: { id: actualOrderId } });

        let advancedPaid = false;
        if ((isAdvancePayment && webhookReqBody.payment.payment_status === 'SUCCESS') || isFinalPayment) {
          advancedPaid = true;
        }

        let orderFinancialInfoUpdateBody = {
          advanceAmountPaid: advancedPaid,
        };

        if (advancedPaid) {
          orderFinancialInfoUpdateBody.advancePaidAt = moment();
        }

        await OrderFinancialInfo.update(orderFinancialInfoUpdateBody, { where: { orderId: actualOrderId } });
      }

      logger.info('Transaction created for order: ' + actualOrderId);
      res.status(httpStatus.CREATED).send({ status: true, message: 'Transaction created', entity: newTrn });
    } else {
      logger.error('Transaction not created, something went wrong');
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Transaction not created, something went wrong');
    }
  } catch (error) {
    logger.error('Transaction not created, something went wrong with reason: ' + error.message);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Transaction not created, something went wrong'
    );
  }
});

module.exports = {
  webhookTransaction,
};
