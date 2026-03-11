const { Category, Service } = require('../../models');

/**
 * Get all Categories for common user
 * @param {string} serviceId
 * @returns {Category}
 */

const getAllCategorieService = async (serviceId) => {
  if (serviceId === 'all') {
    return await Category.findAll();
  }

  return await Category.findAll({ where: { serviceId } });
};

module.exports = {
  getAllCategorieService,
};
