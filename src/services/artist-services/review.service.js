const httpStatus = require('http-status');
const _ = require('lodash');
const { Review, ArtistInfo, CustomerInfo } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const config = require('../../config/config');

/**
 * Get all arts
 * @param {String} artistId
 * @param {Number} page
 * @param {Number} size
 * @returns {Promise<Review>}
 */
const getAllArtistReviewsForAdminService = async (artistId, page, size) => {
  const includeModel = [
    {
      model: ArtistInfo,
      as: 'ArtistInformation',
    },
    {
      model: CustomerInfo,
      as: 'CustomerInformation',
    },
  ];

  const reviewCondition = { artistId };
  console.log(reviewCondition, 'reviewCondition');
  const allReviews = await getPaginationDataFromModel(Review, reviewCondition, page, size, includeModel);

  return allReviews;
};

module.exports = {
  getAllArtistReviewsForAdminService,
};
