const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { superAdminServices } = require('../../services');

const getAllCategories = catchAsync(async (req, res) => {
  const serviceId = req.params.serviceId;
  const allCategories = await superAdminServices.commonService.getAllCategorieService(serviceId);
  res.status(httpStatus.CREATED).send({ status: true, message: 'Categories fetched!', entity: allCategories });
});

module.exports = {
  getAllCategories,
};
