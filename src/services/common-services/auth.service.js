const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const db = require('../../models');
const ApiError = require('../../utils/ApiError');
const { tokenTypes } = require('../../config/tokens');

const { Token, User } = db;

/**
 * Logout
 * @param {string} userId
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (userId, refreshToken, fcmToken) => {
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
  const updatedFcmTokensArr = user.dataValues.fcmTokens?.filter((ft) => ft !== fcmToken);

  const userUpdateBody = { fcmTokens: updatedFcmTokensArr || [], tokenVersion: user.tokenVersion + 1 };
  const apiPromises = [];
  apiPromises.push(refreshTokenDoc.destroy());
  apiPromises.push(user.update(userUpdateBody));

  await Promise.all(apiPromises);
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.userId);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, error.message || 'Please authenticate');
  }
};

module.exports = {
  logout,
  refreshAuth,
};
