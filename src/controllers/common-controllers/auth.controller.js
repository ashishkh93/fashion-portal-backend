const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { commonServices } = require('../../services');
const generateOtp = require('../../utils/common.util');

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

module.exports = {
  login,
  verifyOtp,
  logout,
  refreshTokens,
};
