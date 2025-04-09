const httpStatus = require('http-status');
const { CustomerInfo, CustomerAddress } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { generateAddressSignature } = require('../../utils/address.util');

const fetchAllAddresses = async (customerId) => {
  return await CustomerAddress.findAll({ where: { customerId } });
};

/**
 * Add customer address
 * @param {string} customerId
 * @param {object} body
 * @returns {object}
 */
const addAddressService = async (customerId, body) => {
  const customer = await CustomerInfo.findOne({ where: { customerId } });
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not exist in the system');
  } else {
    const currentAddresses = await fetchAllAddresses(customerId);

    const newAddressSignature = generateAddressSignature(body);

    const isAddressExist = currentAddresses?.some((a) => {
      const existingAddressSignature = generateAddressSignature(a);
      return existingAddressSignature === newAddressSignature;
    });

    if (isAddressExist) {
      throw new ApiError(httpStatus.FORBIDDEN, 'This address already exists in your address book.');
    }

    const createAddressBody = { ...body, customerId };
    let addressInfo = await CustomerAddress.create(createAddressBody);
    return addressInfo;
  }
};

/**
 * Get all address for customer
 * @param {string} customerId
 * @param {object} body
 * @returns {object}
 */
const getAllAddressService = async (customerId) => {
  const addresses = await await fetchAllAddresses(customerId);
  return addresses;
};

/**
 * Edit address
 * @param {string} customerId
 * @param {string} addressId
 * @param {Object} body
 * @returns {Promise}
 */
const editAddressService = async (customerId, addressId, body) => {
  const allAddrs = await await fetchAllAddresses(customerId);
  if (allAddrs) {
    const newEditAddressSignature = generateAddressSignature(body);

    const isAddressExist = allAddrs?.some((a) => {
      if (a.dataValues?.id === addressId) return false;

      const existingAddressSignature = generateAddressSignature(a);
      return existingAddressSignature === newEditAddressSignature;
    });

    if (isAddressExist) {
      throw new ApiError(httpStatus.FORBIDDEN, 'This address already exists in your address book.');
    }

    const adrs = allAddrs?.find((a) => a.dataValues?.id === addressId);
    await adrs.update(body);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Address not found');
  }
};

module.exports = {
  addAddressService,
  getAllAddressService,
  editAddressService,
};
