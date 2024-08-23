const express = require('express');
const validate = require('../../../middlewares/validate');
const { artistControllers } = require('../../../controllers');
const { artistValidation, bankingValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { artistValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  auth('manageBanking'),
  validate(bankingValidation.addArtistBankingInfo),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
  artistControllers.bankingController.addArtistBankingInfo
);

/** Initiate the request to get OTP to update upi */
router.post(
  '/upi/request-otp',
  auth('manageBanking'),
  validate(bankingValidation.initiateOTPRequestToUpdateUpi),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'banking' })),
  artistControllers.bankingController.requestOtpForUpiChange
);

router.post(
  '/upi/verify-otp',
  auth('manageBanking'),
  validate(bankingValidation.verifyOTPToUpdateUpi),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'banking' })),
  artistControllers.bankingController.verifyOTPToUpdateUpi
);

router.patch(
  '/update-upi',
  auth(),
  validate(bankingValidation.editUpi),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'banking' })),
  artistControllers.bankingController.editUpi
);

module.exports = router;
