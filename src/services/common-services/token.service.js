const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../../config/config');
const { Token } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { tokenTypes } = require('../../config/tokens');
const httpStatus = require('http-status');

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (user, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: user.id,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };

  if (type === 'access') {
    payload.v = user.tokenVersion; // add token version to the current siging token to validate the old token
  }

  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const curToken = await Token.findOne({ where: { type, userId, blacklisted: false } });

  if (curToken) {
    const tokenBody = { token, expires: expires.toDate() };
    await curToken.update(tokenBody);
  } else {
    await Token.create({
      token,
      userId,
      expires: expires.toDate(),
      type,
      blacklisted,
    });
  }
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({ where: { userId: payload.sub, token, type, blacklisted: false } });
  if (!tokenDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Token not found');
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  // const accessTokenExpires = moment().add(10, 'seconds');
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return { accessToken, refreshToken };
};

/**
 * Generate create password token (for register via email)
 * @param {string} email
 * @returns {Promise<string>}
 */

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
};
