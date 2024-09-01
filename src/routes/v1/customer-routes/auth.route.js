const express = require('express');
const validate = require('../../../middlewares/validate');
const authValidation = require('../../../validations/auth.validation');
const { commonControllers } = require('../../../controllers');
const addRoleToLoginRoute = require('../../../middlewares/addRole');
const { customerValidate, userValidateWhileVerifyOTP } = require('../../../middlewares/userValidate');
const auth = require('../../../middlewares/auth');
const transactionMiddleware = require('../../../middlewares/transaction');

const router = express.Router();

router.post(
  '/login',
  validate(authValidation.phoneLogin),
  addRoleToLoginRoute('customer'),
  transactionMiddleware,
  commonControllers.authController.login
);
router.post(
  '/:customerId/verify-otp',
  addRoleToLoginRoute('customer'),
  validate(authValidation.customerPhoneVerify),
  userValidateWhileVerifyOTP((req) => req.params.customerId),
  commonControllers.authController.verifyOtp
);

router.patch(
  '/:userId/fcm-token',
  auth(),
  customerValidate((req) => req.params.userId),
  validate(authValidation.updateFcmToken),
  commonControllers.authController.updateFcmToken
);

router.post(
  '/:userId/logout',
  auth(),
  validate(authValidation.logout),
  customerValidate((req) => req.params.userId),
  commonControllers.authController.logout
);

router.post('/refresh-tokens', validate(authValidation.refreshTokens), commonControllers.authController.refreshTokens);

module.exports = router;
