const httpStatus = require('http-status');
const { Category } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPagination, getPagingData } = require('../../utils/paginate');

/**
 * Add Category
 * @param {object} body
 * @returns {Category}
 */
const addCategory = async (body) => {
  try {
    const catBody = {
      name: body.name,
      serviceId: body.serviceId,
    };
    const newCat = await Category.create(catBody);
    const { createdAt, updatedAt, deletedAt, ...others } = newCat.dataValues;
    const responseToSend = { ...others };
    return responseToSend;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Get all Categories
 * @param {number} page
 * @param {number} size
 * @returns {Category}
 */
const getAllCategorieService = async (page, size) => {
  try {
    const conditions = { isActive: true };
    const { limit, offset } = getPagination(page, size);

    let catRes = await Category.findAndCountAll({
      where: [conditions],
      order: [['updatedAt', 'DESC']],
      limit,
      offset,
    });

    let cats = getPagingData(catRes, page, limit);
    return cats;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Get one Category
 * @param {object} catId
 * @returns {Category}
 */
const getSingleCategory = async (catId) => {
  try {
    const currentCat = await Category.findOne({ where: { id: catId, isActive: true } });
    if (currentCat) {
      return currentCat;
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Category not found');
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Edit Category
 * @param {string} catId
 * @param {object} catBody
 * @returns {Category}
 */
const editCatService = async (catBody, catId) => {
  try {
    const currentCat = await Category.findByPk(catId);
    if (currentCat) {
      await Category.update(catBody, { where: { id: catId } });
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Category not found');
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Delete Category
 * @param {string} catId
 * @returns {Category}
 */
const deleteCatService = async (catId) => {
  try {
    const currentCat = await Category.findByPk(catId);
    if (currentCat) {
      await Category.destroy({ where: { id: catId } });
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Category not found');
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

module.exports = {
  addCategory,
  getAllCategorieService,
  getSingleCategory,
  editCatService,
  deleteCatService,
};
