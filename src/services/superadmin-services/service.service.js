const httpStatus = require('http-status');
const { Service } = require('../../models');
const ApiError = require('../../utils/ApiError');

/**
 * Add Service in dev environment with multer image upload algo
 * @param {object} serviceBody
 * @returns {Promise<Service>}
 */
const addService = async (body) => {
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
};

/**
 * Get all services
 * @returns {Promise<Service>}
 */
const getServices = async () => {
  // To override the default scope to include excluded fields
  // Service.scope('defaultScope', { attributes: { include: ['createdAt', 'updatedAt'] } }).findAll();
  const allService = await Service.findAll();
  return allService;
};

/**
 * Get all services for customers
 * @returns {Promise<Service>}
 */
const getServicesForCustomer = async () => {
  const allService = await Service.findAll({
    where: { isActive: true },
    order: [['renderIndex', 'ASC']], // order by renderIndex
  });
  return allService;
};

/**
 * Get Single services
 * @param {String} serviceId
 * @returns {Promise<Service>}
 */
const getSingleService = async (serviceId) => {
  const singleService = await Service.findByPk(serviceId);
  if (singleService) {
    return singleService;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Service not found');
  }
};

/**
 * Edit Service
 * @param {Object} updateServiceBody
 * @param {String} serviceId
 * @returns {Promise}
 */
const editService = async (updateServiceBody, serviceId) => {
  const currentService = await Service.findByPk(serviceId);
  if (currentService) {
    await currentService.update(updateServiceBody);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Service not found');
  }
};

/**
 * Delete Service
 * @param {string} serviceId
 * @returns {Promise}
 */
const deleteService = async (serviceId) => {
  const currentService = await Service.findByPk(serviceId);
  if (currentService) {
    await Service.destroy({ where: { id: serviceId } });
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Service not found');
  }
};

module.exports = {
  addService,
  getServices,
  getServicesForCustomer,
  getSingleService,
  editService,
  deleteService,
};
