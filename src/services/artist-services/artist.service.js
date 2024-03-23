const httpStatus = require('http-status');
const { User, ArtistInfo, ArtistInfoService } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { encrypt, decrypt } = require('../../utils/crypto');
const logger = require('../../config/logger');

/**
 * Edit Category
 * @param {string} artistId
 * @param {object} body
 * @returns {Category}
 */
const updateArtistStatusService = async (body, artistId) => {
  try {
    const currentArtist = await User.findOne({ where: { id: artistId, role: 'artist' } });
    if (currentArtist) {
      const artistUpdateBody = { ...body, reasonToDecline: !!body.isActive ? null : body.reasonToDecline };
      const artistInfoUpdateBody = { status: !!body.isActive ? 'approved' : 'rejected' };

      await User.update(artistUpdateBody, { where: { id: artistId } });
      await ArtistInfo.update(artistInfoUpdateBody, { where: { userId: artistId } });
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Artist not found');
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Add artist info
 * @param {string} artistId
 * @param {object} body
 * @returns {Category}
 */
const addArtistInfoService = async (artistId, body) => {
  try {
    const artist = await ArtistInfo.findOne({ where: { userId: artistId } });
    if (artist) {
      if (artist.status === 'rejected') {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'Yout profile has been rejected by admin, please contact support team for further questions'
        );
      } else if (artist.status === 'approved') {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden!!');
      } else if (artist.status === 'pending') {
        throw new ApiError(httpStatus.FORBIDDEN, 'Your profile is being reviewd by our team, Please be patient!');
      }
    } else {
      const accCipher = encrypt(body.bankAccountNumber);

      const artistInfoEntries = { ...body, bankAccountNumber: accCipher, userId: artistId, status: 'pending' };

      let tmpArtistInfo = await ArtistInfo.create(artistInfoEntries);

      const artistInfoServiceEntries = body?.services?.map((serviceId) => ({
        artistInfoId: tmpArtistInfo.dataValues.id,
        serviceId,
      }));

      await ArtistInfoService.bulkCreate(artistInfoServiceEntries);

      const { userId, status, createdAt } = tmpArtistInfo.dataValues;
      return { userId, status, createdAt };
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.FORBIDDEN, error.message || 'Internal Server Error');
  }
};

module.exports = {
  updateArtistStatusService,
  addArtistInfoService,
};
