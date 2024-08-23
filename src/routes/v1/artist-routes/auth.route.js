const express = require('express');
const validate = require('../../../middlewares/validate');
const authValidation = require('../../../validations/auth.validation');
const { commonControllers } = require('../../../controllers');
const addRoleToLoginRoute = require('../../../middlewares/addRole');
const { userValidateWhileVerifyOTP } = require('../../../middlewares/userValidate');
const transactionMiddleware = require('../../../middlewares/transaction');

const router = express.Router();

router.post(
  '/login',
  validate(authValidation.phoneLogin),
  addRoleToLoginRoute('artist'),
  transactionMiddleware,
  commonControllers.authController.login
);
router.post(
  '/:artistId/verify-otp',
  addRoleToLoginRoute('artist'),
  validate(authValidation.artistPhoneVerify),
  userValidateWhileVerifyOTP((req) => req.params.artistId),
  commonControllers.authController.verifyOtp
);
router.post('/logout', validate(authValidation.logout), commonControllers.authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), commonControllers.authController.refreshTokens);

module.exports = router;
