const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { customerServices } = require('../../services');

const addAddress = catchAsync(async (req, res) => {
  const customerId = req.params.customerId;
  const customerInfo = await customerServices.addressService.addAddressService(customerId, req.body);
  res.status(httpStatus.CREATED).send({ status: true, message: 'Address added!', entity: customerInfo });
});

const getAllAddress = catchAsync(async (req, res) => {
  const customerId = req.params.customerId;
  const customerInfo = await customerServices.addressService.getAllAddressService(customerId);
  res.status(httpStatus.OK).send({ status: true, message: 'All addresses fetched', entity: customerInfo });
});

const editAddress = catchAsync(async (req, res) => {
  const customerId = req.params.customerId;
  const addressId = req.params.addressId;
  await customerServices.addressService.editAddressService(customerId, addressId, req.body);
  res.status(httpStatus.OK).send({ status: true, message: 'Address updated!', entity: req.body });
});

module.exports = {
  addAddress,
  getAllAddress,
  editAddress,
};
