// get data with pagination
const getPagination = (page, size) => {
  const limit = size ? +size : 10000;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: items } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, items, totalPages, currentPage };
};

const getPaginationDataFromModel = async (
  model,
  conditions,
  page,
  size,
  includeModel = [],
  mainModelAttributes,
  orderyKey = 'updatedAt',
  orderBy = 'DESC'
) => {
  const { limit, offset } = getPagination(page, size);

  let responseFromModel = await model.findAndCountAll({
    where: [conditions],
    include: includeModel,
    attributes: mainModelAttributes,
    order: [[orderyKey, orderBy]],
    limit,
    offset,
  });

  let data = getPagingData(responseFromModel, page, limit);
  return data;
};

module.exports = { getPagination, getPagingData, getPaginationDataFromModel };
