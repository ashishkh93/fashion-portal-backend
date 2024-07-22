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
 * @param {Number} page
 * @param {Number} size
 * @param {String} searchToken
 * @returns {Category}
 */

const getAllCategorieService = async (page, size, searchToken) => {
  let include = [
    {
      model: Service,
      as: 'service',
      attributes: ['name'],
      required: false,
    },
  ];

  let whereCondition = {};
  if (searchToken) {
    searchToken = searchToken.trim();
    whereCondition = {
      ...GET_ALL_CATS_SEARCH_QUERY(searchToken),
    };
  }

  const cats = await getPaginationDataFromModel(Category, whereCondition, page, size, include);

  return cats;
};

/**
 * Get one Category
 * @param {String} catId
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
 * @param {object} catBody
 * @returns {Category}
 */
const editCatService = async (catBody, catId) => {
  const currentCat = await Category.findByPk(catId);
  if (currentCat) {
    await Category.update(catBody, { where: { id: catId } });
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
    await Category.destroy({ where: { id: catId } });
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
