const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { superAdminServices } = require('../../services');

const addVendorToCF = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  await superAdminServices.vendorService.addVendorToCFService(req.body, artistId);
  res.status(httpStatus.OK).send({ status: true, message: 'Vendor added to cashfree dashboard', entity: null });
});

const splitPaymentToVendor = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  await superAdminServices.vendorService.splitPaymentToVendorService(req.body, artistId);
  res.status(httpStatus.OK).send({ status: true, message: 'Successfully splitted payment to artist account', entity: null });
});

module.exports = {
  addVendorToCF,
  splitPaymentToVendor,
};
