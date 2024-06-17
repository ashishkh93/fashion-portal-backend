const express = require('express');
const validate = require('../../../middlewares/validate');
const { customerController } = require('../../../controllers');
const { customerValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { customerValidate } = require('../../../middlewares/userValidate');

const router = express.Router();

router.post(
  '/:customerId',
  auth(),
  customerValidate((req) => req.params.customerId),
  validate(customerValidation.getFilteredArtists),
  customerController.getArtistsController.getFilteredArtists
);

router.get(
  '/:customerId/:artistId',
  auth(),
  customerValidate((req) => req.params.customerId),
  validate(customerValidation.getSingleArtist),
  customerController.getArtistsController.getSingleArtist
);

module.exports = router;
