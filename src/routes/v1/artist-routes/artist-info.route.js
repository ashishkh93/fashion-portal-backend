const express = require('express');
const validate = require('../../../middlewares/validate');
const { artistControllers } = require('../../../controllers');
const { artistValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { artistValidate } = require('../../../middlewares/userValidate');
const transactionMiddleware = require('../../../middlewares/transaction');

const router = express.Router();

router
  .route('/:artistId')
  .post(
    auth(),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
    validate(artistValidation.addArtistInfo),
    transactionMiddleware,
    artistControllers.artistInfoController.addArtistInfo
  )
  .get(
    auth(),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
    validate(artistValidation.getArtistInfo),
    artistControllers.artistInfoController.getArtistInfo
  )
  .patch(
    auth(),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
    validate(artistValidation.editArtistInfo),
    transactionMiddleware,
    artistControllers.artistInfoController.editArtistInfo
  );

router.patch(
  '/:artistId/update-upi',
  auth(),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
  validate(artistValidation.editUpi),
  artistControllers.artistInfoController.editUpi
);

module.exports = router;
