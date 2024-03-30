const express = require('express');
const validate = require('../../../middlewares/validate');
const { artistControllers } = require('../../../controllers');
const { artistValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { userValidate } = require('../../../middlewares/userValidate');

const router = express.Router();

router.post(
  '/:artistId/add-info',
  auth(),
  userValidate((req) => req.params.artistId),
  validate(artistValidation.addArtistInfo),
  artistControllers.artistInfoController.addArtistInfo
);
router.get(
  '/:artistId/get-info',
  auth(),
  userValidate((req) => req.params.artistId),
  validate(artistValidation.getAndeditArtistInfo),
  artistControllers.artistInfoController.getArtistInfo
);
router.put(
  '/:artistId/edit-info',
  auth(),
  userValidate((req) => req.params.artistId),
  validate(artistValidation.getAndeditArtistInfo),
  artistControllers.artistInfoController.editArtistInfo
);

module.exports = router;
