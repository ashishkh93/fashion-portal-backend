const { Op } = require('sequelize');
const { dateRangeQuery } = require('./commom-search-query');

const searchQueryForCustomers = (searchToken) => ({
  [Op.or]: [
    { phone: { [Op.iLike]: `%${searchToken}%` } },
    { publicHash: { [Op.iLike]: `%${searchToken}%` } },
    { '$customerInfo.fullName$': { [Op.iLike]: `%${searchToken}%` } },
    { '$customerInfo.email$': { [Op.iLike]: `%${searchToken}%` } },
  ],
});

/**
 * We are filtering here based on the artist current status. If artist just loggedin and he/she doesn't create the profile, then there will be no entry in the ArtistInfo table, so we have put here 2 conditions in OR block
 * @param {string} status
 * @param {Boolean} active
 * @returns
 */
const statusWiseQueryForCustomers = (status) => {
  if (status === 'PENDING') {
    return {
      [Op.and]: [{ '$customerInfo.status$': { [Op.eq]: null } }, { isActive: true }],
    };
  } else {
    return {
      [Op.and]: [{ '$customerInfo.status$': { [Op.eq]: status } }, { isActive: status === 'BLOCKED' ? false : true }],
    };
  }
};

const getIsActiveToConsider = (status) => {
  return status === 'APPROVED' ? true : false;
};

const GET_ALL_CUSTOMERS_SEARCH_QUERY = (searchToken, status, startDate, endDate) => {
  const filters = [];

  if (searchToken) filters.push(searchQueryForCustomers(searchToken));
  if (status) filters.push(statusWiseQueryForCustomers(status, getIsActiveToConsider(status)));
  if (startDate && endDate) filters.push(dateRangeQuery(startDate, endDate));

  return filters.length ? { [Op.and]: filters } : {};
};

module.exports = { GET_ALL_CUSTOMERS_SEARCH_QUERY };
