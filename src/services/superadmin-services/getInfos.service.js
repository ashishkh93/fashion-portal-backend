const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { User, ArtistInfo, ArtistBankingInfo, Service, Category, Art } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const { getSignature } = require('../../utils/cashfree.util');
const { getAuthenticationTokenAPICallback, verifyUPICallback } = require('../../utils/cashfree-payout-api.util');
const { getPlainData } = require('../../utils/common.util');
const { getTransaction } = require('../../middlewares/asyncHooks');
const { GET_ALL_ARTISTS_SEARCH_QUERY } = require('../../search-queries/get-all-artists-search-query');
const { GET_ALL_ARTS_SEARCH_QUERY, getPriceOrdeConfig } = require('../../search-queries/get-all-arts-search-query copy');

/**
 * Get artist information for admin to check artist's status
 * @param {String} artistId
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
 * @param {Number} page
 * @param {Number} size
 * @param {String} searchToken
 * @returns {User}
 */

const getAllArtistService = async (page, size, searchToken) => {
  const includeModel = [
    {
      model: ArtistInfo,
      as: 'artistInfos',
      attributes: ['status', 'fullName', 'businessName', 'email', 'dob', 'gender', 'profilePic', 'workingTime', 'location'],
    },
  ];

  let artistCondition = { role: 'artist' };

  if (searchToken) {
    searchToken = searchToken.trim();
    artistCondition = {
      ...artistCondition,
      ...GET_ALL_ARTISTS_SEARCH_QUERY(searchToken),
    };
  }

  const userAttributes = { exclude: ['fcmToken', 'otp', 'otpExpire', 'deletedAt'] };

  const allArtists = await getPaginationDataFromModel(User, artistCondition, page, size, includeModel, userAttributes);

  return allArtists;
};

/**
 * Get single artist informations
 * @param {String} artistId
 * @returns {User}
 */
const getArtistInfoService = async (artistId) => {
  const artistCondoition = { artistId };
  const includeModel = [
    {
      model: ArtistBankingInfo,
      as: 'artistBankingInfo',
      attributes: ['beneficiaryId', 'upi', 'bankName', 'pan', 'panImage'],
    },
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
    // const decipherUpi = decrypt(artistInfo.upi);
    const artistInfoWithBankAcc = { ...artistInfo.dataValues };
    return artistInfoWithBankAcc;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, "Artist does'n added information yet");
  }
};

/**
 * Get all arts
 * @param {String} artistId
 * @param {Number} page
 * @param {Number} size
 * @param {String} searchToken
 * @param {String} sortKey
 * @returns {Promise<Art>}
 */
const getAllArtsForAdminService = async (artistId, query) => {
  let { page, size, searchToken, sortKey } = query;
  const include = [
    {
      model: Service,
      as: 'service',
      attributes: ['name', 'isActive'],
    },
    {
      model: Category,
      as: 'category',
      attributes: ['name', 'isActive'],
    },
  ];

  let artCondition = { artistId };

  if (searchToken) {
    searchToken = searchToken.trim();
    artCondition = {
      ...artCondition,
      ...GET_ALL_ARTS_SEARCH_QUERY(searchToken),
    };
  }

  const { orderByKey, orderBy } = getPriceOrdeConfig(sortKey);

  const allArts = await getPaginationDataFromModel(Art, artCondition, page, size, include, {}, orderByKey, orderBy);
  return allArts;
};

/**
 * Update artist status
 * @param {String} artistId
 * @param {object} body
 * @returns {Promise}
 */
const updateArtistStatusService = async (body, artistId) => {
  const transaction = getTransaction();

  const currentArtist = await User.findOne({ where: { id: artistId, role: 'artist' } });
  if (currentArtist) {
    const artistUpdateBody = { ...body, reasonToDecline: !!body.isActive ? null : body.reasonToDecline };
    const artistInfoUpdateBody = { status: body.status };
    await User.update(artistUpdateBody, { where: { id: artistId }, transaction });
    await ArtistInfo.update(artistInfoUpdateBody, { where: { artistId }, transaction });
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Artist not found');
  }
};

/**
 * Update art status
 * @param {object} body
 * @param {String} artistId
 * @param {String} artId
 * @returns {Promise}
 */
const approveArtStatusService = async (body, artistId, artId) => {
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
};

/**
 * Update Latitude and Longitude of Artist's location
 * @param {object} body
 * @param {String} artistId
 * @returns {Promise}
 */
const updateLatLongService = async (body, artistId) => {
  await getArtistForAdmin(artistId);
  const artistInfoCondition = { artistId };
  await ArtistInfo.update(body, { where: artistInfoCondition });
};

/**
 * Verify UPI callback from cashfree
 * @param {String} upi
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
 * @param {String} artistId
 * @returns {object}
 */
const verifyUPIService = async (artistId) => {
  try {
    let artist = await ArtistInfo.findOne({
      where: { artistId },
      attributes: [],
      include: [
        {
          model: ArtistBankingInfo,
          as: 'artistBankingInfo',
          attributes: ['upi'],
          where: { upi: { [Op.ne]: null } },
        },
      ],
    });

    if (artist) {
      artist = getPlainData(artist);
      const {
        artistBankingInfo: { upi },
      } = artist;

      const apiResult = await verifyUpiCallback(upi);
      return apiResult;
    } else {
      throw new ApiError(httpStatus.NOT_FOUND, 'Artist not found');
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
  updateLatLongService,
  verifyUPIService,
  verifyUpiCallback,
};
