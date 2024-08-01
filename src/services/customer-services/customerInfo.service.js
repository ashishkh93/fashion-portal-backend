const httpStatus = require('http-status');
const { CustomerInfo, User } = require('../../models');
const ApiError = require('../../utils/ApiError');

/**
 * Add customer info
 * @param {string} customerId
 * @param {object} body
 * @returns {object}
 */
const addCustomerInfoService = async (customerId, body) => {
  const customer = await CustomerInfo.findOne({ where: { customerId } });
  if (customer) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You have already added your info, if you want to edit your info, then please go to the profile section'
    );
  } else {
    const createUserBody = { ...body, customerId, status: 'APPROVED' };
    let tmpCustomerInfo = await CustomerInfo.create(createUserBody);

    const { status, createdAt } = tmpCustomerInfo.dataValues;
    return { customerId, status, createdAt };
  }
};

/**
 * Get customer info
 * @param {string} customerId
 * @param {object} body
 * @returns {object}
 */
const getCustomerInfoService = async (customerId) => {
  const condition = { id: customerId };
  const include = [
    {
      model: CustomerInfo,
      as: 'customerInfo',
      attributes: { exclude: ['id', 'customerId'] },
    },
  ];

  const attributes = ['id', 'role', 'phone', 'fcmToken', 'isActive'];

  const curCustomer = await User.findOne({ where: condition, include, attributes });
  if (curCustomer) {
    if (curCustomer.isActive && curCustomer?.customerInfo?.status === 'APPROVED') {
      return curCustomer;
    } else {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Your account has been blocked, please contact support team as soon as possbile'
      );
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Customer not found');
  }
};

/**
 * Edit customer info
 * @param {string} customerId
 * @param {object} body
 * @returns {Promise}
 */
const editCustomerInfoService = async (customerId, body) => {
  const customer = await CustomerInfo.findOne({ where: { customerId } });
  if (customer) {
    await CustomerInfo.update(body, { where: { customerId } });
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Customer not found');
  }
};

module.exports = {
  addCustomerInfoService,
  editCustomerInfoService,
  getCustomerInfoService,
};
