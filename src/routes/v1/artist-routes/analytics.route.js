const express = require('express');
const validate = require('../../../middlewares/validate');
const { artistControllers } = require('../../../controllers');
const { artistValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { artistValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  auth(),
  validate(artistValidation.getArtistInfo),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'analytics' })),
  artistControllers.analyticsController.getTotlaEarningsForArtist
);

module.exports = router;
