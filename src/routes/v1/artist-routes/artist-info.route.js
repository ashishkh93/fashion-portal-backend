const express = require('express');
const validate = require('../../../middlewares/validate');
const { artistControllers } = require('../../../controllers');
const { artistValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { artistValidate } = require('../../../middlewares/userValidate');
const transactionMiddleware = require('../../../middlewares/transaction');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    auth(),
    validate(artistValidation.addArtistInfo),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
    transactionMiddleware,
    artistControllers.artistInfoController.addArtistInfo
  )
  .get(
    auth('manageArtistProfile'),
    validate(artistValidation.getArtistInfo),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
    artistControllers.artistInfoController.getArtistInfo
  )
  .patch(
    auth(),
    validate(artistValidation.editArtistInfo),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
    transactionMiddleware,
    artistControllers.artistInfoController.editArtistInfo
  );

// get artist status based on their added info
router.get(
  '/get-status',
  auth(),
  validate(artistValidation.getArtistInfo),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'artistInfo' })),
  artistControllers.artistInfoController.getArtistStatus
);

router.patch(
  '/remove-recent-work',
  auth(),
  validate(artistValidation.uploadRecentWorkImage),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'removeRecentWork' })),
  artistControllers.artistInfoController.removeArtistRecentWorkImages
);

module.exports = router;
