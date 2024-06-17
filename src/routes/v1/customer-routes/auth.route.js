const express = require('express');
const validate = require('../../../middlewares/validate');
const authValidation = require('../../../validations/auth.validation');
const { commonControllers } = require('../../../controllers');
const addRoleToLoginRoute = require('../../../middlewares/addRole');
const { customerValidate, userValidateWhileVerifyOTP } = require('../../../middlewares/userValidate');
const auth = require('../../../middlewares/auth');

const router = express.Router();

router.post(
  '/login',
  validate(authValidation.phoneLogin),
  addRoleToLoginRoute('customer'),
  commonControllers.authController.login
);
router.post(
  '/:customerId/verify-otp',
  addRoleToLoginRoute('customer'),
  validate(authValidation.phoneVerify),
  userValidateWhileVerifyOTP((req) => req.params.customerId),
  commonControllers.authController.verifyOtp
);

router.post(
  '/:customerId/fcm-token',
  auth(),
  customerValidate((req) => req.params.customerId),
  validate(authValidation.updateFcmToken),
  commonControllers.authController.updateFcmToken
);

router.post('/logout', validate(authValidation.logout), commonControllers.authController.logout);

router.post('/refresh-tokens', validate(authValidation.refreshTokens), commonControllers.authController.refreshTokens);

module.exports = router;
