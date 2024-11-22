const { Review, ArtistInfo, CustomerInfo } = require('../../models');
const { getPaginationDataFromModel } = require('../../utils/paginate');

const includeModelForReview = [
  {
    model: ArtistInfo,
    as: 'ArtistInformation',
    attributes: ['status', 'fullName', 'businessName', 'profilePic'],
  },
  {
    model: CustomerInfo,
    as: 'CustomerInformation',
    attributes: ['status', 'fullName', 'profilePic'],
  },
];

/**
 * Get all reviews for single artist
 * @param {string} artistId
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Review>}
 */
const getAllArtistReviewsForAdminService = async (artistId, page, size) => {
  const reviewCondition = { artistId };
  console.log(reviewCondition, 'reviewCondition');
  const allReviews = await getPaginationDataFromModel(Review, reviewCondition, page, size, includeModelForReview);

  return allReviews;
};

/**
 * Get all reviews
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Review>}
 */
const getAllReviewsForAdminService = async (page, size) => {
  const allReviews = await getPaginationDataFromModel(Review, {}, page, size, includeModelForReview);

  return allReviews;
};

module.exports = {
  getAllArtistReviewsForAdminService,
  getAllReviewsForAdminService,
};
