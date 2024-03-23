const httpStatus = require('http-status');
const { Service } = require('../../models');
const ApiError = require('../../utils/ApiError');

/**
 * Add Service in dev environment with multer image upload algo
 * @param {object} serviceBody
 * @returns {Promise<Service>}
 */
const addService = async (body) => {
  try {
    const serviceBody = {
      name: body.name,
      icon: body.icon,
      coverImage: body.coverImage,
      renderIndex: body.renderIndex,
    };
    const newService = await Service.create(serviceBody);
    const { createdAt, updatedAt, deletedAt, ...others } = newService.dataValues;
    const responseToSend = { ...others };
    return responseToSend;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Get all services
 * @returns {Promise<Service>}
 */
const getServices = async (body) => {
  try {
    // To override the default scope to include excluded fields
    // Service.scope('defaultScope', { attributes: { include: ['createdAt', 'updatedAt'] } }).findAll();
    const allService = await Service.findAll();
    return allService;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Error while fetching the services');
  }
};

/**
 * Get Single services
 * @param {string} serviceId
 * @returns {Promise<Service>}
 */
const getSingleService = async (serviceId) => {
  try {
    const singleService = await Service.findByPk(serviceId);
    if (singleService) {
      return singleService;
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Service not found');
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Error while fetching service');
  }
};

/**
 * Edit Service
 * @param {object} updateServiceBody
 * @param {string} serviceId
 * @returns {Promise}
 */
const editService = async (updateServiceBody, serviceId) => {
  try {
    const currentService = await Service.findByPk(serviceId);
    if (currentService) {
      await Service.update(updateServiceBody, { where: { id: serviceId } });
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Service not found');
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Delete Service
 * @param {string} serviceId
 * @returns {Promise}
 */
const deleteService = async (serviceId) => {
  try {
    const currentService = await Service.findByPk(serviceId);
    if (currentService) {
      await Service.destroy({ where: { id: serviceId } });
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Service not found');
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Error while deleteing service');
  }
};

module.exports = {
  addService,
  getServices,
  getSingleService,
  editService,
  deleteService,
};
