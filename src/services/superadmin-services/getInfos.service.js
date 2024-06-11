const httpStatus = require('http-status');
const { User, ArtistInfo, Service, Art } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const { decrypt } = require('../../utils/crypto');
const { getSignature } = require('../../utils/cashfree.util');
const { getAuthenticationTokenAPICallback, verifyUPICallback } = require('../../utils/cashfree-payout-api.util');

/**
 * Get artist information for admin to check artist's status
 * @param {string} artistId
 * @returns
 */
const getArtistForAdmin = async (artistId) => {
  const artist = await ArtistInfo.findOne({ where: { artistId } });
  if (artist) {
    return artist;
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'Artist not found');
  }
};

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
      // const decipherAcc = decrypt(artistInfo.bankAccountNumber);
      const decipherUpi = decrypt(artistInfo.upi);
      const artistInfoWithBankAcc = { ...artistInfo.dataValues, upi: decipherUpi };
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
      const artistInfoUpdateBody = { status: body.status };
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
    const artist = await getArtistForAdmin(artistId);

    if (artist.dataValues.status === 'APPROVED') {
      const artCondition = { id: artId, artistId };
      const singleArt = await Art.findOne({ where: artCondition });
      if (singleArt) {
        const artUpdateBody = {
          ...body,
          status: !!body.isActive ? 'APPROVED' : 'REJECTED',
          reasonToDeclineArt: !!body.isActive ? null : body.reasonToDeclineArt,
        };
        await Art.update(artUpdateBody, { where: artCondition });
      } else {
        throw new ApiError(httpStatus.NOT_FOUND, 'Art not found');
      }
    } else {
      throw new ApiError(httpStatus.FORBIDDEN, `Artist is currently ${artist.status}, please approve artist first`);
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Update Latitude and Longitude of Artist's location
 * @param {object} body
 * @param {string} artistId
 * @returns {Promise}
 */
const updateLatLongService = async (body, artistId) => {
  try {
    await getArtistForAdmin(artistId);
    const artistInfoCondition = { artistId };
    await ArtistInfo.update(body, { where: artistInfoCondition });
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Verify UPI callback from cashfree
 * @param {string} upi
 * @returns
 */
const verifyUpiCallback = async (upi) => {
  const cfSignature = getSignature();

  const authenticationTokenRes = await getAuthenticationTokenAPICallback(cfSignature);
  const { token } = authenticationTokenRes.data;

  const validateUpiResult = await verifyUPICallback(token, upi);
  return validateUpiResult;
};

/**
 * Verify artist's UPI via cashfree APIs and methods
 * @param {string} artistId
 * @returns {object}
 */
const verifyUPIService = async (artistId) => {
  try {
    const artist = await getArtistForAdmin(artistId);
    const {
      dataValues: { upi },
    } = artist;
    const decipherUpi = decrypt(upi);
    const apiResult = await verifyUpiCallback(decipherUpi);
    return apiResult;
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
  updateLatLongService,
  verifyUPIService,
  verifyUpiCallback,
};
