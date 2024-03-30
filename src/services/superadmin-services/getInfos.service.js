const httpStatus = require('http-status');
const { User, ArtistInfo, Service, Art } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const { decrypt } = require('../../utils/crypto');
const { getArtist } = require('../artist-services/art.service');

/**
 * Get all services
 * @param {number} page
 * @param {number} size
 * @returns {User}
 */

const getAllArtistService = async (page, size) => {
  try {
    const artistCondition = { role: 'artist' };
    const includeModel = [
      {
        model: ArtistInfo,
        as: 'artistInfos',
        attributes: { exclude: ['bankAccountNumber', 'deletedAt', 'services'] },
        include: [
          {
            model: Service,
            as: 'artistServices', // Ensure this matches the alias we used in association
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
            through: {
              attributes: [], // This excludes all attributes from the join table
            },
          },
        ],
      },
    ];

    const userAttributes = { exclude: ['otp', 'otpExpire', 'deletedAt'] };

    const allArtists = await getPaginationDataFromModel(User, artistCondition, page, size, includeModel, userAttributes);

    return allArtists;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Error while fetching the artists');
  }
};

/**
 * Get single artist informations
 * @param {string} artistId
 * @returns {User}
 */
const getArtistInfoService = async (artistId) => {
  try {
    const artistCondoition = { artistId };
    const includeModel = [
      {
        model: Service,
        as: 'artistServices', // Ensure this matches the alias we used in association
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
        through: {
          attributes: [], // This excludes all attributes from the join table
        },
      },
    ];

    const artistInfoAttrs = { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'services'] };

    const artistInfo = await ArtistInfo.findOne({
      where: [artistCondoition],
      attributes: artistInfoAttrs,
      include: includeModel,
    });

    if (artistInfo) {
      const decipherAcc = decrypt(artistInfo.bankAccountNumber);
      const artistInfoWithBankAcc = { ...artistInfo.dataValues, bankAccountNumber: decipherAcc };
      return artistInfoWithBankAcc;
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "Artist does'n added information yet");
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.FORBIDDEN, error.message || 'Internal Server Error');
  }
};

/**
 * Get all arts
 * @param {string} artistId
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Art>}
 */
const getAllArtsForAdminService = async (artistId, page, size) => {
  try {
    await getArtist(artistId);
    const artCondition = { artistId };
    const allArts = await getPaginationDataFromModel(Art, artCondition, page, size);
    return allArts.items;
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Update artist status
 * @param {string} artistId
 * @param {object} body
 * @returns {Promise}
 */
const updateArtistStatusService = async (body, artistId) => {
  try {
    const currentArtist = await User.findOne({ where: { id: artistId, role: 'artist' } });
    if (currentArtist) {
      const artistUpdateBody = { ...body, reasonToDecline: !!body.isActive ? null : body.reasonToDecline };
      const artistInfoUpdateBody = { status: !!body.isActive ? 'approved' : 'rejected' };
      await User.update(artistUpdateBody, { where: { id: artistId } });
      await ArtistInfo.update(artistInfoUpdateBody, { where: { artistId } });
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Artist not found');
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Update art status
 * @param {object} body
 * @param {string} artistId
 * @param {string} artId
 * @returns {Promise}
 */
const approveArtStatusService = async (body, artistId, artId) => {
  try {
    await getArtist(artistId);
    const artCondition = { id: artId, artistId };
    const singleArt = await Art.findOne({ where: artCondition });
    if (singleArt) {
      const artUpdateBody = {
        ...body,
        status: !!body.isActive ? 'approved' : 'rejected',
        reasonToDeclineArt: !!body.isActive ? null : body.reasonToDeclineArt,
      };
      await Art.update(artUpdateBody, { where: artCondition });
    } else {
      throw new ApiError(httpStatus.NOT_FOUND, 'Art not found');
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

module.exports = {
  getAllArtistService,
  getArtistInfoService,
  getAllArtsForAdminService,
  updateArtistStatusService,
  approveArtStatusService,
};
