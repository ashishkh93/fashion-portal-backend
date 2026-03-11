const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { artistServices } = require('../../services');

/**
 * GET /:artistId/payment/dashboard
 * Returns total income, last payment, pending amount, next payment, monthly chart data
 */
const getPaymentDashboard = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const data = await artistServices.paymentService.getPaymentDashboardService(artistId);
  res.status(httpStatus.OK).send({ status: true, message: 'Payment dashboard fetched!', entity: data });
});

/**
 * GET /:artistId/payment/history
 * Returns paginated payout history with aggregate summary
 */
const getPaymentHistory = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const { page, size } = req.query;
  const data = await artistServices.paymentService.getPaymentHistoryService(artistId, page, size);
  res.status(httpStatus.OK).send({ status: true, message: 'Payment history fetched!', entity: data });
});

/**
 * GET /:artistId/payment/history/:transferId
 * Returns summary + paginated orders for a specific payout transfer
 */
const getTransferOrders = catchAsync(async (req, res) => {
  const { artistId, transferId } = req.params;
  const { page, size } = req.query;
  const data = await artistServices.paymentService.getTransferOrdersService(artistId, transferId, page, size);
  res.status(httpStatus.OK).send({ status: true, message: 'Transfer orders fetched!', entity: data });
});

module.exports = {
  getPaymentDashboard,
  getPaymentHistory,
  getTransferOrders,
};
