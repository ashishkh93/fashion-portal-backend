const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { superAdminServices } = require('../../services');

const getAllReviews = catchAsync(async (req, res) => {
  const { page, size } = req.query;
  const reviews = await superAdminServices.reviewService.getAllReviewsForAdminService(page, size);
  res.status(httpStatus.OK).send({ status: true, message: 'All Reviews fetched!', entity: reviews });
});

const getAllArtistReviews = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const { page, size } = req.query;
  const reviews = await superAdminServices.reviewService.getAllArtistReviewsForAdminService(artistId, page, size);
  res.status(httpStatus.OK).send({ status: true, message: 'Artist Reviews fetched!', entity: reviews });
});

module.exports = {
  getAllReviews,
  getAllArtistReviews,
};
