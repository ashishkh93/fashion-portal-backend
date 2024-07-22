const { Op } = require('sequelize');

const getPriceOrdeConfig = (sortKey) => {
  let orderByKey = 'updatedAt';
  let orderBy = 'DESC';

  if (sortKey) {
    if (sortKey === 'h2l') {
      orderByKey = 'price';
    } else if (sortKey === 'l2h') {
      orderByKey = 'price';
      orderBy = 'ASC';
    }
  }
  return {
    orderByKey,
    orderBy,
  };
};

const GET_ALL_ARTS_SEARCH_QUERY = (searchToken) => {
  return {
    [Op.or]: [
      {
        name: {
          [Op.iLike]: `%${searchToken}%`,
        },
      },
      {
        description: {
          [Op.iLike]: `%${searchToken}%`,
        },
      },
      {
        '$service.name$': {
          [Op.iLike]: `%${searchToken}%`,
        },
      },
      {
        '$category.name$': {
          [Op.iLike]: `%${searchToken}%`,
        },
      },
    ],
  };
};

module.exports = { GET_ALL_ARTS_SEARCH_QUERY, getPriceOrdeConfig };
