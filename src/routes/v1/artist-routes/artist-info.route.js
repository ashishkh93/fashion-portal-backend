const express = require('express');
const validate = require('../../../middlewares/validate');
const { artistControllers } = require('../../../controllers');
const { artistValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { artistValidate } = require('../../../middlewares/userValidate');

const router = express.Router();

router
  .route('/:artistId')
  .post(
    auth(),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
    validate(artistValidation.addArtistInfo),
    artistControllers.artistInfoController.addArtistInfo
  )
  .get(
    auth(),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
    validate(artistValidation.getArtistInfo),
    artistControllers.artistInfoController.getArtistInfo
  )
  .put(
    auth(),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
    validate(artistValidation.editArtistInfo),
    artistControllers.artistInfoController.editArtistInfo
  );

router.put(
  '/:artistId/update-upi',
  auth(),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
  validate(artistValidation.editUpi),
  artistControllers.artistInfoController.editUpi
);

module.exports = router;
