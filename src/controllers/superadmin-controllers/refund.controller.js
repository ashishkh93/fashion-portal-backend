const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { superAdminServices } = require('../../services');

const getRefundRequests = catchAsync(async (req, res) => {
  const { page, size } = req.query;
  const refundReqs = await superAdminServices.refundService.getRefunRequestsService(page, size);

  res.status(httpStatus.OK).send({ status: true, message: 'Refund requests fetched!', entity: refundReqs || null });
});

const initiateRefund = catchAsync(async (req, res) => {
  const { orderId, customerId } = req.params;
  const refund = await superAdminServices.refundService.initiateRefundService(orderId, customerId);

  res.status(httpStatus.CREATED).send({ status: true, message: 'Refund initiated for user', entity: refund || null });
});

module.exports = {
  getRefundRequests,
  initiateRefund,
};
