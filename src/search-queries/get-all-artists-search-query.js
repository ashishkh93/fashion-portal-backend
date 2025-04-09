const { Op } = require('sequelize');

/**
 * Search by fullname, buisenessName, email, location, pincode
 * @param {string} searchToken
 * @returns
 */
const searchQueryForArtist = (searchToken) => ({
  [Op.or]: [
    { phone: { [Op.iLike]: `%${searchToken}%` } },
    { '$artistInfos.businessName$': { [Op.iLike]: `%${searchToken}%` } },
    { '$artistInfos.fullName$': { [Op.iLike]: `%${searchToken}%` } },
    { '$artistInfos.email$': { [Op.iLike]: `%${searchToken}%` } },
    { '$artistInfos.location$': { [Op.iLike]: `%${searchToken}%` } },
    { '$artistInfos.pincode$': { [Op.iLike]: `%${searchToken}%` } },
  ],
});

/**
 * We are filtering here based on the artist current status. If artist just loggedin and he/she doesn't create the profile, then there will be no entry in the ArtistInfo table, so we have put here 2 conditions in OR block
 * @param {string} status
 * @param {Boolean} active
 * @returns
 */
const statusWiseQuery = (status) => ({
  [Op.or]: [
    { '$artistInfos.status$': { [Op.eq]: status } },
    status === 'PENDING' ? { isActive: false } : {}, // ✅ Include NULL artistInfos for PENDING
  ],
});

/**
 * Generates date range filter
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Object}
 */
const dateRangeQuery = (startDate, endDate) => ({
  createdAt: {
    [Op.between]: [new Date(startDate), new Date(new Date(endDate).setHours(23, 59, 59, 999))],
  },
});

const getIsActiveToConsider = (status) => {
  return status === 'APPROVED' ? true : false;
};

/**
 * Generates the final Sequelize query
 * @param {string} searchToken
 * @param {string} status
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Object}
 */
const GET_ALL_ARTISTS_SEARCH_QUERY = (searchToken, status, startDate, endDate) => {
  const filters = [];

  if (searchToken) filters.push(searchQueryForArtist(searchToken));
  if (status) filters.push(statusWiseQuery(status, getIsActiveToConsider(status)));
  if (startDate && endDate) filters.push(dateRangeQuery(startDate, endDate));

  return filters.length ? { [Op.and]: filters } : {};
};

// const GET_ALL_ARTISTS_SEARCH_QUERY = (searchToken, status, startDate, endDate) => {
//   if (searchToken && status && startDate && endDate) {
//     const isActiveToConsider = getIsActiveToConsider(status);
//     return { [Op.and]: [searchQueryForArtist(searchToken), statusWiseQuery(status, isActiveToConsider)] };
//   } else if (searchToken) {
//     return searchQueryForArtist(searchToken);
//   } else if (status) {
//     const isActiveToConsider = getIsActiveToConsider(status);
//     return statusWiseQuery(status, isActiveToConsider);
//   }
// };

module.exports = { GET_ALL_ARTISTS_SEARCH_QUERY };
