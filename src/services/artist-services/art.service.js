const httpStatus = require('http-status');
const _ = require('lodash');
const { User, Art, Service, Category } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const config = require('../../config/config');
const { Op } = require('sequelize');
const { generateArtPublicHash } = require('../../utils/common.util');

const advanceAmountPT = config.pt.advanceAmountPT;

const getArtByArtId = async (artId) => {
  const art = await Art.findByPk(artId);
  if (art) {
    return art;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Art not found');
  }
};

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
 * @param {object} artistInfo
 * @returns {Art}
 */
const addArtService = async (artistId, body, artistInfo) => {
  const promises = [];
  promises.push(Category.findOne({ where: { id: body.categoryId, isActive: true } }));
  promises.push(Service.findOne({ where: { id: body.serviceId, isActive: true } }));

  const catSer = await Promise.all(promises);
  if (catSer.some((res) => !res)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category or Service is not valid, please provide valid Id');
  }

  const sameArtNameExistForArtist = await Art.findOne({ where: { artistId, name: { [Op.iLike]: body.name } } });

  if (sameArtNameExistForArtist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Art with same name exists in your current records');
  }

  const currentArtsCount = await Art.count();
  const hash = generateArtPublicHash(artistInfo?.dataValues?.fullName, currentArtsCount);

  const artBody = { ...body, artistId, status: 'PENDING', isActive: false, hash };
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

  const artCondition = { artistId };
  const allArts = await getPaginationDataFromModel(Art, artCondition, page, size, includeModel);
  return allArts;
};

/**
 * Get single art
 * @param {string} artistId
 * @param {string} artId
 * @returns {Promise<Art>}
 */
const getSingleArtService = async (artistId, artId) => {
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
const editArtService = async (artId, body) => {
  const curArt = await getArtByArtId(artId);

  /**
   * check for advance amount, which must not be greater than 20% of price
   */
  if (_.has(body, 'price') && !_.has(body, 'advanceAmount')) {
    const maxAdvanceAmount = body.price * advanceAmountPT;
    if (curArt.advanceAmount > maxAdvanceAmount) throwErrorForAdvanceAmount(maxAdvanceAmount);
  } else if (_.has(body, 'advanceAmount') && !_.has(body, 'price')) {
    const maxAdvanceAmount = curArt.price * advanceAmountPT;
    if (body.advanceAmount > maxAdvanceAmount) throwErrorForAdvanceAmount(maxAdvanceAmount);
  } else if (_.has(body, 'price') && _.has(body, 'advanceAmount')) {
    const maxAdvanceAmount = body.price * advanceAmountPT;
    if (body.advanceAmount > maxAdvanceAmount) throwErrorForAdvanceAmount(maxAdvanceAmount);
  }

  const updatedArtBody = { ...body, status: 'UNDER_REVIEW' };
  await curArt.update(updatedArtBody);
};

/**
 * Edit art status to active OR inactive
 * @param {string} artistId
 * @param {string} artId
 * @param {object} body
 * @returns {Promise}
 */
const switchArtStatus = async (artistId, artId, body) => {
  const { isActive } = body;
  const curArt = await getArtByArtId(artId);
  await curArt.update({ isActive });
};

module.exports = {
  addArtService,
  getAllArtsService,
  getSingleArtService,
  editArtService,
  getArtist,
  switchArtStatus,
};
