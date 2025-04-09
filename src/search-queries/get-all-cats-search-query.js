const { Op } = require('sequelize');

const searchTokenQuery = (searchToken) => {
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

const isActiveQuery = (active) => {
  return {
    isActive: {
      [Op.eq]: active,
    },
  };
};

const GET_ALL_CATS_SEARCH_QUERY = (searchToken, isActive, isActiveCondition) => {
  if (searchToken && isActiveCondition) {
    return {
      [Op.and]: [searchTokenQuery(searchToken), isActiveQuery(isActive)],
    };
  } else if (searchToken) {
    return searchTokenQuery(searchToken);
  } else if (isActiveCondition) {
    return isActiveQuery(isActive);
  }
};

module.exports = { GET_ALL_CATS_SEARCH_QUERY };
