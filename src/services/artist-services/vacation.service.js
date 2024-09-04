const { Op } = require('sequelize');
const httpStatus = require('http-status');
const { ArtistVacation } = require('../../models');
const ApiError = require('../../utils/ApiError');

/**
 * Add vacation by artist
 * @param {string} artistId
 * @param {Object} body
 * @returns {Promise<ArtistVacation>}
 */
const addVacationService = async (artistId, body) => {
  const vacationExistQuery = {
    artistId,
    [Op.or]: [
      {
        startDate: {
          [Op.between]: [body.startDate, body.endDate],
        },
      },
      {
        endDate: {
          [Op.between]: [body.startDate, body.endDate],
        },
      },
      {
        [Op.and]: [{ startDate: { [Op.lte]: body.startDate } }, { endDate: { [Op.gte]: body.endDate } }],
      },
    ],
  };

  const isVacationExistForFromDate = await ArtistVacation.findOne({
    where: { ...vacationExistQuery },
  });

  if (isVacationExistForFromDate) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You have already added the vacation between the dates you selected, please choose another dates'
    );
  }

  const newVacation = await ArtistVacation.create({ ...body, artistId });
  return newVacation;
};

/**
 *
 * @param {string} vacationId
 */
const getVacationById = async (vacationId) => {
  const vacation = await ArtistVacation.findByPk(vacationId);
  if (!vacation) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No vacation found for provided id');
  }
  return vacation;
};

/**
 * Edit vacation by vacationId
 * @param {string} vacationId
 * @param {Object} body
 * @returns {Promise<ArtistVacation>}
 */
const editVacationService = async (vacationId, body) => {
  const currentVacation = await getVacationById(vacationId);
  await currentVacation.update(body);
};

/**
 * Delete vacation by vacationId
 * @param {string} vacationId
 * @param {Object} body
 * @returns {Promise<ArtistVacation>}
 */
const deleteVacationService = async (vacationId) => {
  const currentVacation = await getVacationById(vacationId);
  await currentVacation.destroy();
};

/**
 * Get all vacation for artist
 * @param {string} artistId
 * @returns {Promise<ArtistVacation>}
 */
const getAllVacationsService = async (artistId) => {
  const vacations = await ArtistVacation.findAll({ where: { artistId } });
  return vacations;
};

module.exports = {
  addVacationService,
  editVacationService,
  deleteVacationService,
  getAllVacationsService,
};
