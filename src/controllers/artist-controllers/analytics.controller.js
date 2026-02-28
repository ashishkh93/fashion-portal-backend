const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { artistServices } = require('../../services');

exports.getTotlaEarningsForArtist = catchAsync(async (req, res) => {
  const totalEarnings = await artistServices.analyticsService.getTotalEarningsForArtistService(req.params.artistId);

  res.status(httpStatus.OK).send({ status: true, message: 'Total Earnings fetched!', entity: totalEarnings });
});

exports.createProfileVisitLog = catchAsync(async (req, res) => {
  const profileVisitLog = await artistServices.analyticsService.createProfileVisitLogService(
    req.params.artistId,
    req.body.customerId
  );

  res.status(httpStatus.OK).send({ status: true, message: 'Profile Visit Log created!', entity: profileVisitLog });
});
