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

const searchQueryForArts = (searchToken) => {
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
      {
        '$artistArt.fullName$': {
          [Op.iLike]: `%${searchToken}%`,
        },
      },
      {
        '$artistArt.businessName$': {
          [Op.iLike]: `%${searchToken}%`,
        },
      },
    ],
  };
};

const statusWiseQueryForArts = (status) => {
  return {
    status: {
      [Op.eq]: status,
    },
  };
};

const GET_ALL_ARTS_SEARCH_QUERY = (searchToken, status) => {
  if (searchToken && status) {
    return { [Op.and]: [searchQueryForArts(searchToken), statusWiseQueryForArts(status)] };
  } else if (searchToken) {
    return searchQueryForArts(searchToken);
  } else if (status) {
    return statusWiseQueryForArts(status);
  }
};

module.exports = { GET_ALL_ARTS_SEARCH_QUERY, getPriceOrdeConfig };
