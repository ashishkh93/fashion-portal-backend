const { filter } = require('compression');
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

const searchQueryForArts = (searchToken) => ({
  [Op.or]: [
    { name: { [Op.iLike]: `%${searchToken}%` } },
    { description: { [Op.iLike]: `%${searchToken}%` } },
    { '$service.name$': { [Op.iLike]: `%${searchToken}%` } },
    { '$category.name$': { [Op.iLike]: `%${searchToken}%` } },
    { '$artist.fullName$': { [Op.iLike]: `%${searchToken}%` } },
    { '$artist.businessName$': { [Op.iLike]: `%${searchToken}%` } },
  ],
});

const statusWiseQueryForArts = (status) => ({
  status: { [Op.eq]: status },
});

const GET_ALL_ARTS_SEARCH_QUERY = (searchToken, status) => {
  const filters = [];
  if (searchToken) filters.push(searchQueryForArts(searchToken));
  if (status) filters.push(statusWiseQueryForArts(status));

  return filters.length ? { [Op.and]: filters } : {};
};

module.exports = { GET_ALL_ARTS_SEARCH_QUERY, getPriceOrdeConfig };
