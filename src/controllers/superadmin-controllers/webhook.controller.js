const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');
const { Transaction, Order } = require('../../models');

const webhookTransaction = catchAsync(async (req, res) => {
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
    details: req.body,
  };
  const newTrn = await Transaction.create(createTransactionBody);
  if (newTrn) {
    if (!!actualOrderId) {
      let advancedPaid = false;
      if ((isAdvancePayment && webhookReqBody.payment.payment_status === 'SUCCESS') || isFinalPayment) {
        advancedPaid = true;
      }
      const orderUpdateBody = {
        transactionId: newTrn.id,
        advanceAmountPaid: advancedPaid,
      };

      await Order.update(orderUpdateBody, { where: { id: actualOrderId } });
    }

    res.status(httpStatus.CREATED).send({ status: true, message: 'Transaction created', entity: newTrn });
  } else {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Transaction not created, something went wrong');
  }
});

module.exports = {
  webhookTransaction,
};
