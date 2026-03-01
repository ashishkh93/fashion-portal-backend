const httpStatus = require('http-status');
const { CustomerInfo, CustomerAddress } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { generateAddressSignature } = require('../../utils/address.util');

const fetchAllAddresses = async (customerId) => {
  return CustomerAddress.findAll({ where: { customerId } });
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
  const addresses = await fetchAllAddresses(customerId);
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
  const allAddrs = await fetchAllAddresses(customerId);

  if (!allAddrs || !allAddrs.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Address not found');
  }

  // Find address to edit
  const adrs = allAddrs.find((a) => a.id === addressId);

  if (!adrs) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
  }

  const newEditAddressSignature = generateAddressSignature(body);

  const isAddressExist = allAddrs.some((a) => {
    if (a.id === addressId) return false;

    const existingAddressSignature = generateAddressSignature(a);
    return existingAddressSignature === newEditAddressSignature;
  });

  if (isAddressExist) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This address already exists in your address book.');
  }

  await adrs.update(body);

  return adrs;
};

module.exports = {
  addAddressService,
  getAllAddressService,
  editAddressService,
};
