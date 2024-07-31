const httpStatus = require('http-status');
const { User, ArtistInfo, ArtistBankingInfo, ArtistInfoService, Service } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { Op } = require('sequelize');
const { verifyUpiCallback } = require('../superadmin-services/getInfos.service');
const { getTransaction } = require('../../middlewares/asyncHooks');
const { getPlainData } = require('../../utils/common.util');

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
        include: [
          {
            model: ArtistBankingInfo,
            as: 'artistBankingInfo',
            attributes: ['beneficiaryId', 'upi', 'pan'],
            where: { upi: { [Op.ne]: null } },
          },
        ],
      },
    ],
  });
  if (artist) {
    return artist;
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
    // const upiCipher = encrypt(body.upi);
    const artistBankingBody = {
      artistId,
      bankName: body.bankName,
      upi: body.upi,
      pan: body.pan,
      panImage: body.panImage,
    };

    const artistInfoEntry = { ...body, artistId, status: 'PENDING' };

    let tmpArtistInfo = await ArtistInfo.create(artistInfoEntry, { transaction });
    await ArtistBankingInfo.create(artistBankingBody, { transaction });

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
 * Get artist info
 * @param {string} artistId
 * @returns {Promise<ArtistInfo>}
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

  const artist = await ArtistInfo.findOne({
    where: [artistCondoition],
    attributes: artistInfoAttrs,
    include: includeModel,
  });

  if (artist) {
    const plainDataArtist = getPlainData(artist);
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

  const apiResult = await verifyUpiCallback(body.upi);

  if (apiResult?.status === 'SUCCESS' && apiResult?.data?.accountExists === 'YES') {
    // const upiCipher = encrypt(body.upi);
    const artist = await ArtistBankingInfo.findOne({ where: { artistId } });

    if (artist) {
      const updateUpiBody = { upi: body.upi };
      await artist.update(updateUpiBody);
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "You haven't added the banking info yet");
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, apiResult?.message || 'Invalid UPI');
  }
};

/**
 * Get artist status based on their info added
 * @param {String} artistId
 */
const getArtistStatusService = async (artistId) => {
  let curArtist = await ArtistInfo.findOne({
    where: { artistId },
    include: [
      {
        model: ArtistBankingInfo,
        as: 'artistBankingInfo',
        attributes: ['upi', 'bankName', 'pan', 'panImage'],
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

module.exports = {
  addArtistInfoService,
  getArtistInfoService,
  editArtistInfoService,
  getApprovedArtist,
  editArtistUPIService,
  getArtistStatusService,
};
