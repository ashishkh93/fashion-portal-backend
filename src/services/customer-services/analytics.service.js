const httpStatus = require('http-status');
const { ArtistProfileVisitLog } = require('../../models');
const ApiError = require('../../utils/ApiError');

/**
 * Create a profile visit log for an artist
 * @param {string} customerId
 * @param {object} body
 * @returns {object}
 */
exports.createArtistProfileVisitLog = async (customerId, body) => {
  const existingProfileVisitLog = await ArtistProfileVisitLog.findOne({
    where: { customerId, artistId: body.artistId },
  });

  if (existingProfileVisitLog) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Profile visit log already exists');
  }

  const logEntry = {
    customerId,
    ...body,
  };

  const profileVisitLog = await ArtistProfileVisitLog.create(logEntry);
  return profileVisitLog;
};
