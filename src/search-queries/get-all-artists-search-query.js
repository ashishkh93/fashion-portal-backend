const { Op } = require('sequelize');

const GET_ALL_ARTISTS_SEARCH_QUERY = (searchToken) => {
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
    ],
  };
};

module.exports = { GET_ALL_ARTISTS_SEARCH_QUERY };
