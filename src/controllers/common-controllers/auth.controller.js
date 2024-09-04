const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { commonServices } = require('../../services');

const login = catchAsync(async (req, res) => {
  const { phone } = req.body;
  const isActive = req.role === 'artist' ? false : true;

  const userBody = { phone, role: req.role, isActive };
  const userId = await commonServices.userService.createUserPhoneAuth(userBody);
  res
    .status(httpStatus.CREATED)
    .send({ status: true, message: 'OTP has been sent to this mobile number', entity: { userId } });
});

const verifyOtp = catchAsync(async (req, res) => {
  const role = req.role;
  const tokens = await commonServices.userService.verifyUserOtp(req.body, role, req.userId);
  res.status(httpStatus.CREATED).send({ status: true, message: 'Otp verified', entity: { ...tokens } });
});

const updateFcmToken = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const fcmToken = req.body.fcmToken;
  await commonServices.userService.updateFcmTokenService(fcmToken, userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const logout = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { token, fcmToken } = req.body;
  await commonServices.authService.logout(userId, token, fcmToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await commonServices.authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

module.exports = {
  login,
  verifyOtp,
  updateFcmToken,
  logout,
  refreshTokens,
};
