const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { superAdminServices } = require('../../services');

const payoutToArtists = catchAsync(async (req, res) => {
  const payouts = await superAdminServices.payoutService.payoutToArtistsService(req.body);
  res.status(httpStatus.OK).send({ status: true, message: 'Payout initiated!', entity: payouts || null });
});

const verifyPayout = catchAsync(async (req, res) => {
  const { batchPayoutId } = req.params;
  const payoutStatus = await superAdminServices.payoutService.batchPayoutVerifyService(batchPayoutId);
  res.status(httpStatus.OK).send({ status: true, message: 'Payout status fetched!', entity: payoutStatus || null });
});

module.exports = {
  payoutToArtists,
  verifyPayout,
};
