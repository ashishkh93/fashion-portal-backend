const httpStatus = require('http-status');
const _ = require('lodash');
const { User, Art, Service, Category } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const config = require('../../config/config');

const advanceAmountPT = config.pt.advanceAmountPT;

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
  // await getApprovedArtist(artistId);
  const artBody = { ...body, artistId, status: 'PENDING', isActive: false };
  const art = await Art.create(artBody);
  return art;
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
    const includeModel = [
      {
        model: Service,
        as: 'service',
      },
      {
        model: Category,
        as: 'category',
      },
    ];

    // const artCondition = { artistId, status: 'APPROVED', isActive: true };
    const artCondition = { artistId };
    const allArts = await getPaginationDataFromModel(Art, artCondition, page, size, includeModel);
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
    const include = [
      {
        model: Service,
        as: 'service',
      },
      {
        model: Category,
        as: 'category',
      },
    ];
    const curArt = await Art.findOne({ where: { id: artId, artistId }, include });
    if (curArt) {
      return curArt;
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Art not found');
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

const throwErrorForAdvanceAmount = (maxAdvanceAmount) => {
  throw new ApiError(httpStatus.BAD_REQUEST, `advanceAmount cannot be more than ${maxAdvanceAmount}`);
};

/**
 * Edit art
 * @param {string} artistId
 * @param {string} artId
 * @param {object} body
 * @returns {Promise}
 */
const editArtService = async (artistId, artId, body) => {
  try {
    const curArt = await Art.findOne({ where: { id: artId, artistId } });
    if (curArt) {
      /**
       * check for advance amount, which must not be greater than 20% of price
       */
      if (_.has(body, 'price') && !_.has(body, 'advanceAmount')) {
        const maxAdvanceAmount = body.price * advanceAmountPT;
        if (curArt.advanceAmount > maxAdvanceAmount) throwErrorForAdvanceAmount(maxAdvanceAmount);
      } else if (_.has(body, 'advanceAmount') && !_.has(body, 'price')) {
        const maxAdvanceAmount = curArt.price * advanceAmountPT;
        if (body.advanceAmount > maxAdvanceAmount) throwErrorForAdvanceAmount(maxAdvanceAmount);
      }

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
