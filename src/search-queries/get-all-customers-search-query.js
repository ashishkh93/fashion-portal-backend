const { Op } = require('sequelize');

const GET_ALL_CUSTOMERS_SEARCH_QUERY = (searchToken) => {
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

module.exports = { GET_ALL_CUSTOMERS_SEARCH_QUERY };
