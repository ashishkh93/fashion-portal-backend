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
  return { totalItems, items: items || [], totalPages, currentPage };
};

const getPaginationDataFromModel = async (
  model,
  conditions,
  page,
  size,
  includeModel = [],
  mainModelAttributes = {},
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
    distinct: true, // this will only count the number of rows from main model (which will not lead to get wrong count)
  });

  let data = getPagingData(responseFromModel, page, limit);
  return data;
};

module.exports = { getPagination, getPagingData, getPaginationDataFromModel };
