const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { superAdminServices } = require('../../services');

const payoutToArtists = catchAsync(async (req, res) => {
  const payouts = await superAdminServices.payoutService.payoutToArtistsService(req.body);
  res.status(httpStatus.OK).send({ status: true, message: 'Payout initiated!', entity: payouts || null });
});

const verifyPayout = catchAsync(async (req, res) => {
  const { batchTransferId } = req.params;
  const payoutStatus = await superAdminServices.payoutService.batchPayoutVerifyService(batchTransferId);
  res.status(httpStatus.OK).send({ status: true, message: 'Payout status fetched!', entity: payoutStatus || null });
});

const getAllPayouts = catchAsync(async (req, res) => {
  const { page, size } = req.query;
  const allPayouts = await superAdminServices.payoutService.getAllPayoutsService(page, size);
  res.status(httpStatus.OK).send({ status: true, message: 'Payouts fetched!', entity: allPayouts || [] });
});

module.exports = {
  payoutToArtists,
  verifyPayout,
  getAllPayouts,
};
