const httpStatus = require('http-status');
const { User } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { Op } = require('sequelize');
const { verifyUpiCallback } = require('../superadmin-services/getInfos.service');
const { getUniqueTempId } = require('../../utils/common.util');

/**
 * Verify Upi service
 * @param {String} artistId
 * @param {String} upi
 * @returns {Object}
 */
const verifyUpiService = async (artistId, upi) => {
  try {
    let artist = await User.findByPk(artistId);

    if (artist) {
      const verificationId = getUniqueTempId(artistId);
      const apiResult = await verifyUpiCallback(upi, null, verificationId); // middle one is artist name attribute

      if (apiResult.status === 'VALID') {
        return apiResult;
      } else {
        logger.error('Invalid UPI: ' + JSON.stringify(apiResult));
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid UPI');
      }
    } else {
      throw new ApiError(httpStatus.NOT_FOUND, 'Artist not found');
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

module.exports = {
  verifyUpiService,
};
