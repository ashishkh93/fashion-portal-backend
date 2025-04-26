const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const db = require('../../models');
const ApiError = require('../../utils/ApiError');
const { tokenTypes } = require('../../config/tokens');
const { getTransaction } = require('../../middlewares/asyncHooks');

const { Token, FirebaseUser } = db;

/**
 * Logout
 * @param {string} userId
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (user, refreshToken, fcmToken) => {
  const transaction = getTransaction();
  const refreshTokenDoc = await Token.findOne({
    where: {
      userId: user.id,
      token: refreshToken,
      type: tokenTypes.REFRESH,
      blacklisted: false,
    },
  });

  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Token Not found');
  }

  const userUpdateBody = { tokenVersion: user.tokenVersion + 1 };

  await Promise.all([
    FirebaseUser.destroy({ where: { fcmToken }, transaction }),
    refreshTokenDoc.destroy({ transaction }),
    user.update(userUpdateBody, { transaction }),
  ]);
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
