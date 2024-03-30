const express = require('express');
const validate = require('../../../middlewares/validate');
const { artistControllers } = require('../../../controllers');
const { artValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { userValidate } = require('../../../middlewares/userValidate');

const router = express.Router();

router.get(
  '/:artistId/get-all-arts',
  auth(),
  userValidate((req) => req.params.artistId),
  validate(artValidation.getArts),
  artistControllers.artController.getAllArts
);

router.get(
  '/:artistId/:artId',
  auth(),
  userValidate((req) => req.params.artistId),
  validate(artValidation.getSingleArt),
  artistControllers.artController.getSingleArt
);

router.post(
  '/:artistId/add-art',
  auth(),
  userValidate((req) => req.params.artistId),
  validate(artValidation.addArt),
  artistControllers.artController.addArt
);

router.put(
  '/:artistId/edit-art',
  auth(),
  userValidate((req) => req.params.artistId),
  validate(artValidation.editArt),
  artistControllers.artController.editArt
);

module.exports = router;
