const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { commonServices, artistServices } = require('../../services');
const generateOtp = require('../../utils/common.util');
const ApiError = require('../../utils/ApiError');

const login = catchAsync(async (req, res) => {
  const { phone } = req.body;

  const { otp, otpExpire } = await generateOtp(10, phone, 91);
  const isActive = req.role === 'artist' ? false : true;

  const userBody = { phone, otp, otpExpire, role: req.role, isActive };
  await commonServices.userService.createUserPhoneAuth(userBody);
  res.status(httpStatus.CREATED).send({ status: true, message: 'OTP has been sent to this mobile number' });
});

const verifyOtp = catchAsync(async (req, res) => {
  const role = req.role;
  const tokens = await commonServices.userService.verifyUserOtp(req.body, role);
  res.status(httpStatus.CREATED).send({ status: true, message: 'Otp verified', entity: { ...tokens } });
});

const logout = catchAsync(async (req, res) => {
  await commonServices.authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await commonServices.authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const changeArtistStatus = catchAsync(async (req, res) => {
  const artistId = req.params.artistId;
  await artistServices.artistInfoService.updateArtistStatusService(req.body, artistId);
  res.status(httpStatus.OK).send({ status: true, message: 'Status updated', entity: null });
});

module.exports = {
  login,
  verifyOtp,
  logout,
  refreshTokens,
  changeArtistStatus,
};
