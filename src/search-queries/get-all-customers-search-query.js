const { Op } = require('sequelize');

const searchQueryForCustomers = (searchToken) => {
  return {
    [Op.or]: [
      {
        phone: {
          [Op.iLike]: `%${searchToken}%`,
        },
      },
      {
        '$customerInfo.fullName$': {
          [Op.iLike]: `%${searchToken}%`,
        },
      },
      {
        '$customerInfo.email$': {
          [Op.iLike]: `%${searchToken}%`,
        },
      },
    ],
  };
};

/**
 * We are filtering here based on the artist current status. If artist just loggedin and he/she doesn't create the profile, then there will be no entry in the ArtistInfo table, so we have put here 2 conditions in OR block
 * @param {string} status
 * @param {Boolean} active
 * @returns
 */
const statusWiseQueryForCustomers = (status, active) => {
  return {
    [Op.and]: [
      {
        isActive: {
          [Op.eq]: active,
        },
      },
      {
        '$customerInfo.status$': {
          [Op.eq]: status,
        },
      },
    ],
  };
};

const getIsActiveToConsider = (status) => {
  return status === 'APPROVED' ? true : false;
};

const GET_ALL_CUSTOMERS_SEARCH_QUERY = (searchToken, status) => {
  if (searchToken && status) {
    const isActiveToConsider = getIsActiveToConsider(status);
    return { [Op.and]: [searchQueryForCustomers(searchToken), statusWiseQueryForCustomers(status, isActiveToConsider)] };
  } else if (searchToken) {
    return searchQueryForCustomers(searchToken);
  } else if (status) {
    const isActiveToConsider = getIsActiveToConsider(status);
    return statusWiseQueryForCustomers(status, isActiveToConsider);
  }
};

module.exports = { GET_ALL_CUSTOMERS_SEARCH_QUERY };
