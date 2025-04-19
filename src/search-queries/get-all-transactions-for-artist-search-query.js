const { Op } = require('sequelize');
const { dateRangeQuery } = require('./commom-search-query');

/**
 * Search by customer's fullname, and Order Identity
 * @param {string} searchToken
 * @returns
 */
const searchByName = (searchToken, searchKey) => ({
  [Op.or]: [{ '$customer.fullName$': { [Op.iLike]: `%${searchToken}%` } }],
});

/**
 * Search by Payment type
 * @param {string} searchToken
 * @returns
 */
const searchByPaymentType = (paymentType) => ({
  paymentType: { [Op.eq]: paymentType },
});

/**
 * Filtering with Payment status
 * @param {string} status
 * @param {Boolean} active
 * @returns
 */
const statusWiseQuery = (status) => ({
  paymentStatus: { [Op.eq]: status },
});

/**
 * Generates the final Sequelize query
 * @param {string} searchToken
 * @param {string} status
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Object}
 */
const GET_ALL_TRANSACIONS_FOR_ARTIST_SEARCH_QUERY = (searchToken, status, paymentType, startDate, endDate, searchKey) => {
  const filters = [];

  if (searchToken) filters.push(searchByName(searchToken, searchKey));
  if (paymentType) filters.push(searchByPaymentType(paymentType));
  if (status) filters.push(statusWiseQuery(status));
  if (startDate && endDate) filters.push(dateRangeQuery(startDate, endDate));

  return filters.length ? { [Op.and]: filters } : {};
};

module.exports = { GET_ALL_TRANSACIONS_FOR_ARTIST_SEARCH_QUERY };
