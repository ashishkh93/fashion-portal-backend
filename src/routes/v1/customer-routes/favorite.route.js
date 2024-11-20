const express = require('express');
const validate = require('../../../middlewares/validate');
const { customerController } = require('../../../controllers');
const { customerValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { customerValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    auth(),
    customerValidate((req) => req.params.customerId),
    validate(customerValidation.addFavArtistService),
    customerController.favoriteController.addOrRemoveFavorite
  )
  .get(
    auth(),
    customerValidate((req) => req.params.customerId),
    validate(customerValidation.getAllFavArtistService),
    customerController.favoriteController.getAllAFavArtists
  );

module.exports = router;
