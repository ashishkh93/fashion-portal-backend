const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { artistServices } = require('../../services');

const requestOtpForUpiChange = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  await artistServices.bankingService.requestOtpForUpiChangeService(artistId, req.body, req.artist, req.user);
  res.status(httpStatus.OK).send({ status: true, message: 'Otp sent, just check your text messages!' });
});

const verifyOTPToUpdateUpi = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  await artistServices.bankingService.verifyOTPToUpdateUpiService(artistId, req.body, req.artist, req.user);
  res.status(httpStatus.OK).send({ status: true, message: 'Otp verified!' });
});

const addArtistBankingInfo = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  const artistInfo = await artistServices.bankingService.addArtistBankingInfoService(artistId, req.body);
  res.status(httpStatus.CREATED).send({ status: true, message: 'Banking information added!', entity: artistInfo });
});

const editUpi = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  await artistServices.bankingService.editArtistUPIService(artistId, req.body, req.artist, req.user);
  res.status(httpStatus.OK).send({ status: true, message: 'Upi updated!', entity: req.body });
});

module.exports = {
  requestOtpForUpiChange,
  addArtistBankingInfo,
  verifyOTPToUpdateUpi,
  editUpi,
};
