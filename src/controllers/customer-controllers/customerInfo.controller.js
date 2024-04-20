const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { customerServices } = require('../../services');

const addCustomerInfo = catchAsync(async (req, res) => {
  const customerId = req.params.customerId;
  const customerInfo = await customerServices.customerInfoService.addCustomerInfoService(customerId, req.body);
  res.status(httpStatus.CREATED).send({ status: true, message: 'Successfully created profile!', entity: customerInfo });
});

const getCustomerInfo = catchAsync(async (req, res) => {
  const customerId = req.params.customerId;
  const customerInfo = await customerServices.customerInfoService.getCustomerInfoService(customerId);
  res.status(httpStatus.OK).send({ status: true, message: 'Profile fetched successfully', entity: customerInfo });
});

const editCustomerInfo = catchAsync(async (req, res) => {
  const customerId = req.params.customerId;
  await customerServices.customerInfoService.editCustomerInfoService(customerId, req.body);
  res.status(httpStatus.OK).send({ status: true, message: 'Successfully updated profile!', entity: req.body });
});

module.exports = {
  addCustomerInfo,
  getCustomerInfo,
  editCustomerInfo,
};
