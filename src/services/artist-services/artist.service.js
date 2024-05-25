const httpStatus = require('http-status');
const { User, ArtistInfo, ArtistInfoService, Service } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { encrypt, decrypt } = require('../../utils/crypto');
const { Op } = require('sequelize');

const checkArtistStatus = async (artist, mode) => {
  if (artist.status === 'rejected' || artist.status === 'blocked') {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `Your profile has been ${artist.status} by admin, please contact support team for further questions`
    );
  } else if (artist.status === 'approved') {
    if (mode === 'edit') {
      return true;
    } else {
      throw new ApiError(httpStatus.FORBIDDEN, 'You have already added your infos!');
    }
  } else if (artist.status === 'pending') {
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
        where: { status: 'approved' },
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
  try {
    const artist = await ArtistInfo.findOne({ where: { artistId } });

    if (artist) {
      await checkArtistStatus(artist, 'add');
    } else {
      const upiCipher = encrypt(body.upi);

      const artistInfoEntries = { ...body, artistId, upi: upiCipher, status: 'pending' };

      let tmpArtistInfo = await ArtistInfo.create(artistInfoEntries);

      const artistInfoServiceEntries = body?.services?.map((serviceId) => ({
        artistInfoId: tmpArtistInfo.dataValues.id,
        artistId,
        serviceId,
      }));

      await ArtistInfoService.bulkCreate(artistInfoServiceEntries);

      const { status, createdAt } = tmpArtistInfo.dataValues;
      return { artistId, status, createdAt };
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.FORBIDDEN, error.message || 'Internal Server Error');
  }
};

/**
 * Get artist info
 * @param {string} artistId
 * @returns {Promise<ArtistInfo>}
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

    const artistInfoAttrs = { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'bankAccountNumber', 'services'] };

    const artist = await ArtistInfo.findOne({
      where: [artistCondoition],
      attributes: artistInfoAttrs,
      include: includeModel,
    });

    if (artist) {
      const plainDataArtist = artist.get({ plain: true });
      const { upi } = plainDataArtist;

      const decipherUpi = decrypt(upi);

      // if (artist.status !== 'approved') {
      //   await checkArtistStatus(artist.dataValues);
      //   return null;
      // } else {
      //   return artist;
      // }
      return { ...plainDataArtist, upi: decipherUpi };
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Artist not found');
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.FORBIDDEN, error.message || 'Internal Server Error');
  }
};

/**
 * Edit artist info
 * @param {string} artistId
 * @param {object} body
 * @returns {Promise}
 */
const editArtistInfoService = async (artistId, body, artistInfo) => {
  try {
    // Deleting services if any are marked for deletion
    if (body.deletedServices?.length) {
      await ArtistInfoService.destroy({
        where: {
          serviceId: {
            [Op.in]: body.deletedServices,
          },
          artistId,
        },
      });
    }

    // Adding new services if any are provided
    if (body.newServices?.length) {
      const newServiceEntries = body.newServices.map((serviceId) => ({
        artistInfoId: artistInfo.id,
        serviceId,
        artistId,
      }));
      await ArtistInfoService.bulkCreate(newServiceEntries);
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
    await ArtistInfo.update(artistInfoUpdateBody, { where: { artistId } });
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.FORBIDDEN, error.message || 'Internal Server Error');
  }
};

/**
 * Edit artist upi id
 * @param {string} artistId
 * @param {object} body
 * @returns {Promise<ArtistInfo>}
 */
const editArtistUPIService = async (artistId, body, artistInfo) => {
  try {
    if (!artistInfo) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Artist not found');
    }
    /**
     * this operation must be verified for security reason
     * consider to send & verify otp before update
     */
    const upiCipher = encrypt(body.upi);
    const artistInfoUpdateBody = { upi: upiCipher };
    await ArtistInfo.update(artistInfoUpdateBody, { where: { artistId } });
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.FORBIDDEN, error.message || 'Internal Server Error');
  }
};

module.exports = {
  addArtistInfoService,
  getArtistInfoService,
  editArtistInfoService,
  getApprovedArtist,
  editArtistUPIService,
};
