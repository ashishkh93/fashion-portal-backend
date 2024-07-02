const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { mainArtService } = require('../../services/superadmin-services');

const getAllServices = catchAsync(async (req, res) => {
  const services = await mainArtService.getServicesForCustomer();
  res.status(httpStatus.OK).send({ status: true, message: 'Services fetched!', entity: services || {} });
});

module.exports = {
  getAllServices,
};
