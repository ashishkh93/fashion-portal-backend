const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { superAdminServices } = require('../../services');

const adminSignup = catchAsync(async (req, res) => {
  const { phone } = req.body;
  const isActive = req.role === 'artist' ? false : true;

  const userBody = { phone, role: req.role, isActive };
  const adminId = await superAdminServices.adminAuthService.createAdminPhoneAuth(userBody);
  res.status(httpStatus.CREATED).send({ status: true, message: 'User created!', entity: { userId: adminId } });
});

const adminLogin = catchAsync(async (req, res) => {
  const { phone } = req.body;
  const userBody = { phone, role: req.role, isActive: true };
  const userId = await superAdminServices.adminAuthService.adminLoginPhoneAuth(userBody);
  res
    .status(httpStatus.CREATED)
    .send({ status: true, message: 'OTP has been sent to this mobile number', entity: { userId } });
});

const adminLogout = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { refreshToken } = req.body;
  await superAdminServices.adminAuthService.adminLogout(userId, refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  adminSignup,
  adminLogin,
  adminLogout,
};
