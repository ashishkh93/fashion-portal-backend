const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { artistServices } = require('../../services');

const upiVerification = catchAsync(async (req, res) => {
  const { artistId } = req.params;
  const { upi } = req.body;
  const upiValidateResponse = await artistServices.verificationService.verifyUpiService(artistId, upi);
  res.status(httpStatus.OK).send({ status: true, message: 'Upi verification done!', entity: upiValidateResponse || null });
});

module.exports = {
  upiVerification,
};
