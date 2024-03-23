const express = require('express');
const validate = require('../../../middlewares/validate');
const { artistControllers } = require('../../../controllers');
const { artistValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');

const router = express.Router();

router.post(
  '/:artistId/add-info',
  auth(),
  validate(artistValidation.addArtistInfo),
  artistControllers.artistInfoController.addArtistInfo
);

module.exports = router;
