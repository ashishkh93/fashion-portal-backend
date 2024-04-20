const httpStatus = require('http-status');
const { User, ArtistInfo, ArtistInfoService, Service } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { encrypt } = require('../../utils/crypto');
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
      const accCipher = encrypt(body.bankAccountNumber);
      const artistInfoEntries = { ...body, artistId, bankAccountNumber: accCipher, status: 'pending' };

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
      // if (artist.status !== 'approved') {
      //   await checkArtistStatus(artist.dataValues);
      //   return null;
      // } else {
      //   return artist;
      // }
      return artist;
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
    // const artist = await ArtistInfo.findOne({ where: { artistId } });

    // await checkArtistStatus(artist, 'edit');

    if (!!body.deletedServices) {
      // Need to think on this operation before deleting all entries from ArtistInfoService table
      await ArtistInfoService.destroy({
        where: {
          serviceId: {
            [Op.in]: body.deletedServices,
          },
          artistId,
        },
      });
    }

    if (!!body.newServices) {
      const newServiceEntries = body?.newServices?.map((serviceId) => ({
        artistInfoId: artistInfo.id,
        serviceId,
        artistId,
      }));
      await ArtistInfoService.bulkCreate(newServiceEntries);
    }

    let updatedServicesArray = [...artistInfo.services];

    if (body.deletedServices) {
      updatedServicesArray = updatedServicesArray.filter((id) => !body.deletedServices.includes(id));
    }
    if (body.newServices) {
      body.newServices?.map((id) => {
        if (!updatedServicesArray.includes(id)) {
          updatedServicesArray.push(id);
        }
      });
    }

    if (!!body.bankAccountNumber) {
      // this operation must be verified for security reason (avoid to do like this directly)
      const accCipher = encrypt(body.bankAccountNumber);
      const artistInfoUpdateBody = { ...body, services: updatedServicesArray, bankAccountNumber: accCipher };

      await ArtistInfo.update(artistInfoUpdateBody, { where: { artistId } });
    } else {
      const artistInfoUpdateBody = { ...body, services: updatedServicesArray };
      await ArtistInfo.update(artistInfoUpdateBody, { where: { artistId } });
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.FORBIDDEN, error.message || 'Internal Server Error');
  }
};

module.exports = {
  addArtistInfoService,
  getArtistInfoService,
  editArtistInfoService,
  getApprovedArtist,
};
