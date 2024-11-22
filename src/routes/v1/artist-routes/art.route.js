const express = require('express');
const validate = require('../../../middlewares/validate');
const { artistControllers } = require('../../../controllers');
const { artValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { artistValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    auth(),
    validate(artValidation.getArts),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'art' })),
    artistControllers.artController.getAllArts
  )
  .post(
    auth(),
    validate(artValidation.addArt),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'art' })),
    artistControllers.artController.addArt
  );

router
  .route('/:artId')
  .get(
    auth(),
    validate(artValidation.getSingleArt),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'art' })),
    artistControllers.artController.getSingleArt
  )
  .patch(
    auth(),
    validate(artValidation.editArt),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'art' })),
    artistControllers.artController.editArt
  );

router.patch(
  '/:artId/switch-status',
  auth(),
  validate(artValidation.switchArtStatus),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'art' })),
  artistControllers.artController.switchArtStatus
);

module.exports = router;
