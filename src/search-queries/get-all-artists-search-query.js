const { Op } = require('sequelize');

/**
 * Search by fullname, buisenessName, email, location, pincode
 * @param {String} searchToken
 * @returns
 */
const searchQueryForArtist = (searchToken) => {
  return {
    [Op.or]: [
      {
        phone: {
          [Op.iLike]: `%${searchToken}%`,
        },
      },
      {
        '$artistInfos.businessName$': {
          [Op.iLike]: `%${searchToken}%`,
        },
      },
      {
        '$artistInfos.fullName$': {
          [Op.iLike]: `%${searchToken}%`,
        },
      },
      {
        '$artistInfos.email$': {
          [Op.iLike]: `%${searchToken}%`,
        },
      },
      {
        '$artistInfos.location$': {
          [Op.iLike]: `%${searchToken}%`,
        },
      },
      {
        '$artistInfos.pincode$': {
          [Op.iLike]: `%${searchToken}%`,
        },
      },
    ],
  };
};

/**
 * We are filtering here based on the artist current status. If artist just loggedin and he/she doesn't create the profile, then there will be no entry in the ArtistInfo table, so we have put here 2 conditions in OR block
 * @param {String} status
 * @param {Boolean} active
 * @returns
 */
const statusWiseQuery = (status, active) => {
  return {
    [Op.or]: [
      {
        '$artistInfos.artistId$': {
          // Assuming 'artistId' is the unique key of artistInfos
          [Op.ne]: null,
        },
        '$artistInfos.status$': {
          [Op.eq]: status,
        },
      },
      {
        isActive: {
          [Op.eq]: status === 'PENDING' ? active : null,
        },
        '$artistInfos.artistId$': null,
      },
    ],
  };
};

const getIsActiveToConsider = (status) => {
  return status === 'APPROVED' ? true : false;
};

const GET_ALL_ARTISTS_SEARCH_QUERY = (searchToken, status) => {
  if (searchToken && status) {
    const isActiveToConsider = getIsActiveToConsider(status);
    return { [Op.and]: [searchQueryForArtist(searchToken), statusWiseQuery(status, isActiveToConsider)] };
  } else if (searchToken) {
    return searchQueryForArtist(searchToken);
  } else if (status) {
    const isActiveToConsider = getIsActiveToConsider(status);
    return statusWiseQuery(status, isActiveToConsider);
  }
};

module.exports = { GET_ALL_ARTISTS_SEARCH_QUERY };
