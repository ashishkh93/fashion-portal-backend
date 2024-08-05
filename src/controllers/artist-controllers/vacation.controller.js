const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { artistServices } = require('../../services');

const addVacation = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const newVacation = await artistServices.vacationService.addVacationService(artistId, req.body);
  res.status(httpStatus.CREATED).send({ status: true, message: 'Vacation added!', entity: newVacation });
});

const editVacation = catchAsync(async (req, res) => {
  const { vacationId } = req.params;
  await artistServices.vacationService.editVacationService(vacationId, req.body);
  res.status(httpStatus.OK).send({ status: true, message: 'Vacation updated!', entity: req.body });
});

const getAllVacations = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const allVacations = await artistServices.vacationService.getAllVacationsService(artistId);
  res.status(httpStatus.OK).send({ status: true, message: 'Vacations fetched!', entity: allVacations || [] });
});

const deleteVacation = catchAsync(async (req, res) => {
  const { vacationId } = req.params;
  await artistServices.vacationService.deleteVacationService(vacationId);
  res.status(httpStatus.OK).send({ status: true, message: 'Vacation deleted!' });
});

module.exports = {
  addVacation,
  editVacation,
  getAllVacations,
  deleteVacation,
};
