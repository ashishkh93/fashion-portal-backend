const httpStatus = require('http-status');
const { customerServices } = require('../../services');
const catchAsync = require('../../utils/catchAsync');

exports.createArtistProfileVisitLog = catchAsync(async (req, res) => {
  const profileVisitLog = await customerServices.analyticsService.createArtistProfileVisitLog(
    req.params.customerId,
    req.body
  );
  res.status(httpStatus.CREATED).send({ status: true, message: 'Profile visit log created!', entity: profileVisitLog });
});
