const { Op } = require('sequelize');

const GET_ALL_CATS_SEARCH_QUERY = (searchToken) => {
  return {
    [Op.or]: [
      {
        name: {
          [Op.iLike]: `%${searchToken}%`,
        },
      },
      {
        '$service.name$': {
          [Op.iLike]: `%${searchToken}%`,
        },
      },
    ],
  };
};

module.exports = { GET_ALL_CATS_SEARCH_QUERY };
