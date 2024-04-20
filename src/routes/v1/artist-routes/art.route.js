const express = require('express');
const validate = require('../../../middlewares/validate');
const { artistControllers } = require('../../../controllers');
const { artValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { artistValidate } = require('../../../middlewares/userValidate');

const router = express.Router();

router
  .route('/:artistId')
  .get(
    auth(),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'art' })),
    validate(artValidation.getArts),
    artistControllers.artController.getAllArts
  )
  .post(
    auth(),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'art' })),
    validate(artValidation.addArt),
    artistControllers.artController.addArt
  );

router
  .route('/:artistId/:artId')
  .get(
    auth(),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'art' })),
    validate(artValidation.getSingleArt),
    artistControllers.artController.getSingleArt
  )
  .put(
    auth(),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'art' })),
    validate(artValidation.editArt),
    artistControllers.artController.editArt
  );

module.exports = router;
