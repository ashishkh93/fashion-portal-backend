const express = require('express');
const validate = require('../../../middlewares/validate');
const { artistControllers } = require('../../../controllers');
const { artistValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { artistValidate } = require('../../../middlewares/userValidate');

const router = express.Router();

router.post(
  '/:artistId/add-info',
  auth(),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
  validate(artistValidation.addArtistInfo),
  artistControllers.artistInfoController.addArtistInfo
);
router.get(
  '/:artistId/get-info',
  auth(),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
  validate(artistValidation.getArtistInfo),
  artistControllers.artistInfoController.getArtistInfo
);
router.put(
  '/:artistId/edit-info',
  auth(),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
  validate(artistValidation.editArtistInfo),
  artistControllers.artistInfoController.editArtistInfo
);

module.exports = router;
