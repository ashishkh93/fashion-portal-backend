const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { superAdminServices } = require('../../services');

const getAllServices = catchAsync(async (req, res) => {
  const allServices = await superAdminServices.mainArtService.getServices({ isActive: 'true' });
  res.status(httpStatus.CREATED).send({ status: true, message: 'Services fetched!', entity: allServices });
});

module.exports = {
  getAllServices,
};
