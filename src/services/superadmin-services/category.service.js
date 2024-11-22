const httpStatus = require('http-status');
const { Category, Service } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPaginationDataFromModel, getPagingData, getPagination } = require('../../utils/paginate');
const { Op } = require('sequelize');
const { GET_ALL_CATS_SEARCH_QUERY } = require('../../search-queries/get-all-cats-search-query copy');

/**
 * Add Category
 * @param {object} body
 * @returns {Category}
 */
const addCategory = async (body) => {
  const service = await Service.findByPk(body.serviceId);

  if (!service.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Service is not active, please choose another service to add category');
  }

  const catBody = {
    name: body.name,
    serviceId: body.serviceId,
  };
  const newCat = await Category.create(catBody);
  const { createdAt, updatedAt, deletedAt, ...others } = newCat.dataValues;
  const responseToSend = { ...others };
  return responseToSend;
};

/**
 * Get all Categories
 * @param {number} query.page
 * @param {number} query.size
 * @param {string} query.searchToken
 * @returns {Category}
 */

const getAllCategorieService = async (query) => {
  let { page, size, searchToken, isActive } = query;

  let include = [
    {
      model: Service,
      as: 'service',
      attributes: ['name'],
      required: false,
    },
  ];

  let whereCondition = {};
  const isActiveCondition = isActive !== undefined && isActive !== null && isActive !== '';

  if (searchToken || isActiveCondition) {
    searchToken = searchToken && searchToken.trim();
    whereCondition = {
      ...GET_ALL_CATS_SEARCH_QUERY(searchToken, isActive, isActiveCondition),
    };
  }

  const cats = await getPaginationDataFromModel(Category, whereCondition, page, size, include);

  return cats;
};

/**
 * Get one Category
 * @param {string} catId
 * @returns {Category}
 */
const getSingleCategory = async (catId) => {
  const currentCat = await Category.findOne({ where: { id: catId } });
  if (currentCat) {
    return currentCat;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category not found');
  }
};

/**
 * Edit Category
 * @param {string} catId
 * @param {Object} catBody
 * @returns {Category}
 */
const editCatService = async (catBody, catId) => {
  const currentCat = await Category.findByPk(catId);
  if (currentCat) {
    await currentCat.update(catBody);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category not found');
  }
};

/**
 * Delete Category
 * @param {string} catId
 * @returns {Category}
 */
const deleteCatService = async (catId) => {
  const currentCat = await Category.findByPk(catId);
  if (currentCat) {
    await currentCat.destroy();
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category not found');
  }
};

module.exports = {
  addCategory,
  getAllCategorieService,
  getSingleCategory,
  editCatService,
  deleteCatService,
};
