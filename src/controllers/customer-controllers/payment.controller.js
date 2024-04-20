const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { customerServices } = require('../../services');

const paymentInitiate = catchAsync(async (req, res) => {
  const { customerId, orderId } = req.params;
  const { dataValues } = req.user;
  const order = await customerServices.paymentService.paymentInitiateService(customerId, orderId, req.body, dataValues);

  res.status(httpStatus.CREATED).send({ status: true, message: 'Payment request initiated!', entity: order || null });
});

const getPaymentOrder = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const paymentOrder = await customerServices.paymentService.fetchPaymentOrderService(orderId);
  res.status(httpStatus.OK).send({ status: true, message: 'Payment order fetched', entity: paymentOrder || null });
});

const paymentVerify = catchAsync(async (req, res) => {
  const { cfOrderId } = req.params;
  const payment = await customerServices.paymentService.paymentVerifyService(cfOrderId);
  res.status(httpStatus.OK).send({ status: true, message: 'Payment succeed', entity: payment || null });
});

const getSinglePaymentFromCFOrderId = catchAsync(async (req, res) => {
  const { cfOrderId, cfPaymentId } = req.params;
  const payment = await customerServices.paymentService.getSinglePaymentRefByCFOrderIdService(cfOrderId, cfPaymentId);
  res.status(httpStatus.OK).send({ status: true, message: 'Payment fetched successfully', entity: payment || null });
});

module.exports = {
  paymentInitiate,
  getPaymentOrder,
  paymentVerify,
  getSinglePaymentFromCFOrderId,
};
