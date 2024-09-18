const express = require('express');
const validate = require('../../../middlewares/validate');
const authValidation = require('../../../validations/auth.validation');
const { commonControllers } = require('../../../controllers');
const addRoleToLoginRoute = require('../../../middlewares/addRole');
const { userValidateWhileVerifyOTP, adminValidate } = require('../../../middlewares/userValidate');
const auth = require('../../../middlewares/auth');

const router = express.Router();

router.post(
  '/login',
  validate(authValidation.phoneLogin),
  addRoleToLoginRoute('superAdmin'),
  commonControllers.authController.login
);
router.post(
  '/:adminId/verify-otp',
  addRoleToLoginRoute('superAdmin'),
  validate(authValidation.adminPhoneVerify),
  userValidateWhileVerifyOTP((req) => req.params.adminId),
  commonControllers.authController.verifyOtp
);

router.post(
  '/:userId/logout',
  auth(),
  validate(authValidation.adminLogout),
  adminValidate((req) => ({ superAdminId: req.params.userId })),
  commonControllers.authController.adminLogout
);

// router.post('/logout', validate(authValidation.logout), commonControllers.authController.logout);

router.post('/refresh-tokens', validate(authValidation.refreshTokens), commonControllers.authController.refreshTokens);

module.exports = router;
