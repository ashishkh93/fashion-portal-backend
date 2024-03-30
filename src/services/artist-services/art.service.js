const httpStatus = require('http-status');
const { User, Art, ArtistInfo } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPaginationDataFromModel } = require('../../utils/paginate');

const getArtist = async (artistId) => {
  const artist = await User.findOne({ where: { id: artistId } });
  if (artist) {
    if (!artist?.dataValues?.isActive) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'You dont have access right now, your profile is being reviewed by team, please be patient'
      );
    } else {
      return artist;
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Artist not found');
  }
};

/**
 * Add art
 * @param {string} artistId
 * @param {object} body
 * @returns {Art}
 */
const addArtService = async (artistId, body) => {
  try {
    const artist = await User.findOne({ where: { id: artistId } });
    if (artist) {
      const artBody = { ...body, artistId, status: 'pending', isActive: false };
      const art = await Art.create(artBody);
      return art;
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Artist not found');
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
const getAllArtsService = async (artistId, page, size) => {
  try {
    await getArtist(artistId);
    const artCondition = { artistId, status: 'approved', isActive: true };
    const allArts = await getPaginationDataFromModel(Art, artCondition, page, size);
    return allArts;
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Get single art
 * @param {string} artistId
 * @param {string} artId
 * @returns {Promise<Art>}
 */
const getSingleArtService = async (artistId, artId) => {
  try {
    await getArtist(artistId);
    const curArt = await Art.findOne({ where: { id: artId, artistId } });
    if (curArt) {
      return curArt;
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Art not found');
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Edit art
 * @param {string} artistId
 * @param {object} body
 * @returns {Promise}
 */

const editArtService = async (artistId, body) => {
  try {
    const artId = body.artId;
    const curArt = await Art.findOne({ where: { id: artId, artistId } });
    if (curArt) {
      const updatedArtBody = { ...body };
      await Art.update(updatedArtBody, { where: { id: artId, artistId } });
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Art not found');
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

module.exports = {
  addArtService,
  getAllArtsService,
  getSingleArtService,
  editArtService,
  getArtist,
};
