const express = require('express');
const validate = require('../../../middlewares/validate');
const authValidation = require('../../../validations/auth.validation');
const { commonControllers } = require('../../../controllers');
const addRoleToLoginRoute = require('../../../middlewares/addRole');

const router = express.Router();

router.post(
  '/login',
  validate(authValidation.phoneLogin),
  addRoleToLoginRoute('user'),
  commonControllers.authController.login
);
router.post(
  '/verify-otp',
  addRoleToLoginRoute('user'),
  validate(authValidation.phoneVerify),
  commonControllers.authController.verifyOtp
);
router.post('/logout', validate(authValidation.logout), commonControllers.authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), commonControllers.authController.refreshTokens);

module.exports = router;
