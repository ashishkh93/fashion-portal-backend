const httpStatus = require('http-status');
const { User, ArtistInfo, ArtistVacation, ArtistBankingInfo, ArtistInfoService, Service } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { Op } = require('sequelize');
const { verifyUpiCallback } = require('../superadmin-services/getInfos.service');
const { getTransaction } = require('../../middlewares/asyncHooks');
const { getPlainData, getUniqueTempId } = require('../../utils/common.util');
const { getNumberOfImagesArtistCanUpload } = require('../../utils/order.util');
const cacheUtil = require('../../cache/cache-util');
const { CACHE_KEYS } = require('../../cache/cache-keys');
const logger = require('../../config/logger');

const checkArtistStatus = async (artist, mode) => {
  if (artist.status === 'REJECTED' || artist.status === 'BLOCKED' || artist.status === 'SUSPENDED') {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `Your profile has been ${artist.status} by admin, please contact support team for further questions`
    );
  } else if (artist.status === 'APPROVED') {
    if (mode === 'edit') {
      return true;
    } else {
      throw new ApiError(httpStatus.FORBIDDEN, 'You have already added your infos!');
    }
  } else if (artist.status === 'PENDING') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Your profile is being reviewd by our team, Please be patient!');
  }
};

/**
 * Get artist
 * @param {string} artistId
 * @returns {object}
 */

const getApprovedArtist = async (artistId) => {
  const artist = await User.findOne({
    where: { id: artistId, role: 'artist', isActive: true },
    include: [
      {
        model: ArtistInfo,
        as: 'artistInfos',
        where: { status: 'APPROVED' },
        attributes: ['artistId', 'status', 'fullName'],
        required: true,
        include: [
          {
            model: ArtistVacation,
            as: 'vacations',
            attributes: ['startDate', 'endDate'],
          },
        ],
      },
    ],
  });
  if (artist) {
    return getPlainData(artist);
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'Artist is not approved yet');
  }
};

/**
 * Add artist info
 * @param {string} artistId
 * @param {object} body
 * @returns {object}
 */
const addArtistInfoService = async (artistId, body) => {
  const transaction = getTransaction();
  const artist = await ArtistInfo.findOne({ where: { artistId } });

  if (artist) {
    // safe side checking and giving the response based on the artist status
    await checkArtistStatus(artist, 'add');
  } else {
    const artistInfoEntry = { ...body, artistId, status: 'PENDING' };
    let tmpArtistInfo = await ArtistInfo.create(artistInfoEntry, { transaction });

    const artistInfoServiceEntries = body?.services?.map((serviceId) => ({
      artistInfoId: tmpArtistInfo.dataValues.id,
      artistId,
      serviceId,
    }));

    await ArtistInfoService.bulkCreate(artistInfoServiceEntries, { transaction });

    const { status, createdAt } = tmpArtistInfo.dataValues;
    return { artistId, status, createdAt };
  }
};

/**
 * Add artist banking info
 * @param {string} artistId
 * @param {Object} body
 */
const addArtistBankingInfoService = async (artistId, body) => {
  const artistBanking = await ArtistBankingInfo.findOne({ where: { artistId } });
  if (artistBanking) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Banking informations already added');
  } else {
    const bankingBody = { ...body, artistId };
    await ArtistBankingInfo.create(bankingBody);
    return body;
  }
};

/**
 * Get artist info
 * @param {string} artistId
 * @returns {Promise<ArtistInfo>}
 */
const getArtistInfoService = async (artistId) => {
  const cacheKey = CACHE_KEYS.ARTIST.ARTIST_DETAILS;

  const cachedArtistDetails = cacheUtil.getFromCache(cacheKey);
  if (cachedArtistDetails) {
    logger.info(`Cache Hit for ${cacheKey}`);
    return cachedArtistDetails;
  }

  const artistCondoition = { artistId };
  const includeModel = [
    {
      model: ArtistBankingInfo,
      as: 'artistBankingInfo',
      attributes: ['beneficiaryId', 'upi'],
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

  const artist = await ArtistInfo.findOne({
    where: [artistCondoition],
    attributes: artistInfoAttrs,
    include: includeModel,
  });

  if (artist) {
    const plainDataArtist = getPlainData(artist);
    cacheUtil.setInCache(cacheKey, plainDataArtist);
    return plainDataArtist;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Artist not found');
  }
};

/**
 * Edit artist info
 * @param {string} artistId
 * @param {object} body
 * @returns {Promise}
 */
const editArtistInfoService = async (artistId, body, artistInfo) => {
  const transaction = getTransaction();

  // Deleting services if any are marked for deletion
  if (body.deletedServices?.length) {
    await ArtistInfoService.destroy({
      where: {
        serviceId: {
          [Op.in]: body.deletedServices,
        },
        artistId,
      },
      transaction,
    });
  }

  // Adding new services if any are provided
  if (body.newServices?.length) {
    const newServiceEntries = body.newServices.map((serviceId) => ({
      artistInfoId: artistInfo.id,
      serviceId,
      artistId,
    }));
    await ArtistInfoService.bulkCreate(newServiceEntries, { transaction });
  }

  // Updating the services array
  let updatedServicesArray = [...artistInfo.services];

  if (body.deletedServices?.length) {
    updatedServicesArray = updatedServicesArray.filter((id) => !body.deletedServices.includes(id));
  }

  if (body.newServices?.length) {
    updatedServicesArray = [...new Set([...updatedServicesArray, ...body.newServices])];
  }

  // Preparing update payload
  const artistInfoUpdateBody = {
    ...body,
    services: updatedServicesArray,
  };

  // Updating the artist info
  await ArtistInfo.update(artistInfoUpdateBody, { where: { artistId }, transaction });
};

/**
 * Edit artist upi id
 * @param {string} artistId
 * @param {object} body
 * @returns {Promise<ArtistInfo>}
 */
const editArtistUPIService = async (artistId, body, artistInfo) => {
  if (!artistInfo) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Artist not found');
  }
  /**
   * this operation must be verified for security reason
   * consider to send & verify otp before update
   */

  // const apiResult = await verifyUpiCallback(body.upi);

  const verificationId = getUniqueTempId(artistId);
  const apiResult = await verifyUpiCallback(body.upi, null, verificationId);

  if (apiResult.status === 'VALID') {
    const artist = await ArtistBankingInfo.findOne({ where: { artistId } });

    if (artist) {
      const updateUpiBody = { upi: body.upi };
      await artist.update(updateUpiBody);
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "You haven't provided the banking info yet");
    }
  } else {
    logger.error('Invalid UPI: ' + JSON.stringify(apiResult));
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid UPI');
  }
};

/**
 * Get artist status based on their info added
 * @param {string} artistId
 */
const getArtistStatusService = async (artistId) => {
  let curArtist = await ArtistInfo.findOne({
    where: { artistId },
    include: [
      {
        model: ArtistBankingInfo,
        as: 'artistBankingInfo',
        attributes: ['upi'],
      },
    ],
  });

  let profileInfoAdded = false;
  let bankInfoAdded = false;

  if (curArtist) {
    curArtist = getPlainData(curArtist);
    profileInfoAdded = !!curArtist;
    bankInfoAdded = !!curArtist.artistBankingInfo;
  }

  return { profileInfoAdded, bankInfoAdded };
};

/**
 * Upload artist's recent work images
 * @param {string} artistId
 * @param {object} body
 * @param {ArtistInfo} artistInfo
 */
const uploadArtistRecentWorkImagesService = async (artistId, body, artistInfo) => {
  const { recentWorkImages } = artistInfo.dataValues;
  const numberOfImagesArtistCanUpload = await getNumberOfImagesArtistCanUpload(artistId);

  const currentImagesLength = recentWorkImages?.lenght ?? 0;
  const totalImagesLength = currentImagesLength + body.recentWorkImages.length;

  if (totalImagesLength > numberOfImagesArtistCanUpload) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You can upload max ' +
        numberOfImagesArtistCanUpload +
        ' images, if you want to upload more images, please removee old images first'
    );
  }

  const newImages = Array.isArray(recentWorkImages)
    ? [...recentWorkImages, ...body.recentWorkImages]
    : [...body.recentWorkImages];

  await artistInfo.update({ recentWorkImages: newImages });
  return newImages;
};

/**
 * Remove artist's recent work images
 * @param {string} artistId
 * @param {object} body
 * @param {ArtistInfo} artistInfo
 */
const removeArtistRecentWorkImagesService = async (body, artistInfo) => {
  const { recentWorkImages } = artistInfo.dataValues;
  const allPayloadImagesIncludedInCurrentRecentWorkImages = body.recentWorkImages.every((imageUrl) =>
    recentWorkImages.includes(imageUrl)
  );

  if (!allPayloadImagesIncludedInCurrentRecentWorkImages) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid image urls');
  }

  const newImages = recentWorkImages.filter((imageUrl) => !body.recentWorkImages.includes(imageUrl));

  await artistInfo.update({ recentWorkImages: newImages });
  return newImages;
};

module.exports = {
  addArtistInfoService,
  addArtistBankingInfoService,
  getArtistInfoService,
  editArtistInfoService,
  getApprovedArtist,
  editArtistUPIService,
  getArtistStatusService,
  uploadArtistRecentWorkImagesService,
  removeArtistRecentWorkImagesService,
};
