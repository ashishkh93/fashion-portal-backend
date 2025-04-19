const { Op } = require('sequelize');
const { dateRangeQuery } = require('./commom-search-query');

/**
 * Search by customer's fullname, email, and Order Identity
 * @param {string} searchToken
 * @returns
 */
const searchQueryForArtist = (searchToken, searchKey) => ({
  [Op.or]: [
    { orderIdentity: { [Op.iLike]: `%${searchToken}%` } },
    (!searchKey || searchKey === 'customerSearch') && { '$orderCustomer.fullName$': { [Op.iLike]: `%${searchToken}%` } },
    (!searchKey || searchKey === 'artistSearch') && { '$orderArtist.fullName$': { [Op.iLike]: `%${searchToken}%` } },
  ],
});

/**
 * Filtering with order status
 * @param {string} status
 * @param {Boolean} active
 * @returns
 */
const statusWiseQuery = (status) => ({
  status: { [Op.eq]: status },
});

/**
 * Generates the final Sequelize query
 * @param {string} searchToken
 * @param {string} status
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Object}
 */
const GET_ALL_ORDER_FOR_ARTIST_SEARCH_QUERY = (searchToken, status, startDate, endDate, searchKey) => {
  const filters = [];

  if (searchToken) filters.push(searchQueryForArtist(searchToken, searchKey));
  if (status) filters.push(statusWiseQuery(status));
  if (startDate && endDate) filters.push(dateRangeQuery(startDate, endDate));

  return filters.length ? { [Op.and]: filters } : {};
};

module.exports = { GET_ALL_ORDER_FOR_ARTIST_SEARCH_QUERY };
