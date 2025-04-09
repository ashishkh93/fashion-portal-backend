const { Op } = require('sequelize');
const { dateRangeQuery } = require('./commom-search-query');

/**
 * Search by customer's fullname, email, and Order Identity
 * @param {string} searchToken
 * @returns
 */
const searchQueryForArtist = (searchToken) => ({
  [Op.or]: [
    { '$ArtistInformation.fullName$': { [Op.iLike]: `%${searchToken}%` } },
    { '$ArtistInformation.businessName$': { [Op.iLike]: `%${searchToken}%` } },
    { '$CustomerInformation.fullName$': { [Op.iLike]: `%${searchToken}%` } },
  ],
});

/**
 * Generates the final Sequelize query
 * @param {string} searchToken
 * @param {string} status
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Object}
 */
const GET_ALL_REVIEW_SEARCH_QUERY = (searchToken, startDate, endDate) => {
  const filters = [];

  if (searchToken) filters.push(searchQueryForArtist(searchToken));
  if (startDate && endDate) filters.push(dateRangeQuery(startDate, endDate));

  return filters.length ? { [Op.and]: filters } : {};
};

module.exports = { GET_ALL_REVIEW_SEARCH_QUERY };
