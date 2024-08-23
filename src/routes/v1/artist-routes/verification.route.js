const express = require('express');
const { artistControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { bankingValidation } = require('../../../validations');
const { artistValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true });

router.post(
  '/upi',
  auth(),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'verification' })),
  validate(bankingValidation.verifyUpiInArtist),
  artistControllers.verificationController.upiVerification
);

module.exports = router;
