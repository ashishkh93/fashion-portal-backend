const { Review, ArtistInfo, CustomerInfo, Order } = require('../../models');
const { GET_ALL_REVIEW_SEARCH_QUERY } = require('../../search-queries/get-all-reviews-search-query');
const { getPaginationDataFromModel } = require('../../utils/paginate');

const includeModelForReview = [
  {
    model: ArtistInfo,
    as: 'ArtistInformation',
    attributes: ['status', 'fullName', 'email', 'businessName', 'profilePic'],
  },
  {
    model: CustomerInfo,
    as: 'CustomerInformation',
    attributes: ['status', 'fullName', 'email', 'profilePic'],
  },
  {
    model: Order,
    as: 'order',
    attributes: ['status', 'orderIdentity', 'date'],
  },
];

/**
 * Get reviews for admin
 * @param {string} artistId
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Review>}
 */
const getReviewsForAdminService = async (query, idKey, id) => {
  let { page, size, searchToken, startDate, endDate } = query;

  let reviewCondition = idKey ? { [idKey]: id } : {};

  if (searchToken || (startDate && endDate)) {
    searchToken = searchToken && searchToken.trim();
    reviewCondition = {
      ...reviewCondition,
      ...GET_ALL_REVIEW_SEARCH_QUERY(searchToken, startDate, endDate),
    };
  }

  const allReviews = await getPaginationDataFromModel(Review, reviewCondition, page, size, includeModelForReview);

  return allReviews;
};

module.exports = {
  getReviewsForAdminService,
};
