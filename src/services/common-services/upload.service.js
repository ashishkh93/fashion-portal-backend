const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../../models/token.model');
const ApiError = require('../../utils/ApiError');
const { tokenTypes } = require('../../config/tokens');

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const uploadFileService = async (file) => {
  console.log(file, 'file==');
};

module.exports = {
  uploadFileService,
};
