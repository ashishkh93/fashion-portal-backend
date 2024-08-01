const express = require('express');
const validate = require('../../../middlewares/validate');
const { customerController } = require('../../../controllers');
const { customerValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { customerValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  auth(),
  validate(customerValidation.getFilteredArtists),
  customerValidate((req) => req.params.customerId),
  customerController.getArtistsController.getFilteredArtists
);

router.get(
  '/:artistId',
  auth(),
  validate(customerValidation.getSingleArtist),
  customerValidate((req) => req.params.customerId),
  customerController.getArtistsController.getSingleArtist
);

module.exports = router;
