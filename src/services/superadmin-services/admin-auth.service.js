const httpStatus = require('http-status');
const db = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getTransaction } = require('../../middlewares/asyncHooks');
const { createOtpRequest } = require('../common-services/otp.service');
const { generateUserPublicId } = require('../../utils/common.util');

const { User, SuperAdminInfo } = db;

const getAdminByPhoneAndRole = async (phone, role) => {
  return await User.findOne({ where: { phone: phone, role: role } });
};

const createAdminPhoneAuth = async (userBody) => {
  const transaction = getTransaction();
  const { phone, role } = userBody;
  const user = await getAdminByPhoneAndRole(phone, role);
  if (!user) {
    const currentUsersCount = await User.count();
    const hash = generateUserPublicId('S', currentUsersCount);

    const newUser = await User.create({ ...userBody, publicHash: hash }, { transaction });
    await SuperAdminInfo.create({ ...userBody, superAdminId: newUser.id }, { transaction });

    return newUser.id;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already exists with same number!');
  }
};

const adminLoginPhoneAuth = async (userBody) => {
  const { phone, role } = userBody;
  const user = await getAdminByPhoneAndRole(phone, role);
  if (user) {
    await createOtpRequest(user.id, 'LOGIN');
    return user.id;
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
  }
};

/**
 * Logout
 * @param {string} userId
 * @param {string} refreshToken
 * @returns {Promise}
 */
const adminLogout = async (userId, refreshToken) => {
  const refreshTokenDoc = await Token.findOne({
    where: {
      userId,
      token: refreshToken,
      type: tokenTypes.REFRESH,
      blacklisted: false,
    },
  });

  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Token Not found');
  }

  const user = await User.findByPk(userId);
  const userUpdateBody = { tokenVersion: user.tokenVersion + 1 };

  const apiPromises = [];
  apiPromises.push(refreshTokenDoc.destroy());
  apiPromises.push(user.update(userUpdateBody));

  await Promise.all(apiPromises);
};

module.exports = {
  createAdminPhoneAuth,
  adminLoginPhoneAuth,
  adminLogout,
};
