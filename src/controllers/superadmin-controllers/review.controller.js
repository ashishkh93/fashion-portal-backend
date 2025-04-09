const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { superAdminServices } = require('../../services');

const getAllReviews = catchAsync(async (req, res) => {
  const reviews = await superAdminServices.reviewService.getReviewsForAdminService(req.query);
  res.status(httpStatus.OK).send({ status: true, message: 'All Reviews fetched!', entity: reviews });
});

const getAllArtistReviews = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const reviews = await superAdminServices.reviewService.getReviewsForAdminService(req.query, 'artistId', artistId);
  res.status(httpStatus.OK).send({ status: true, message: 'Artist Reviews fetched!', entity: reviews });
});

const getAllCustomerReviews = catchAsync(async (req, res) => {
  const { customerId } = req.params;
  const reviews = await superAdminServices.reviewService.getReviewsForAdminService(req.query, 'givenBy', customerId);
  res.status(httpStatus.OK).send({ status: true, message: 'Artist Reviews fetched!', entity: reviews });
});

module.exports = {
  getAllReviews,
  getAllArtistReviews,
  getAllCustomerReviews,
};
