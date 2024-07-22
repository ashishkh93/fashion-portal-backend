const express = require('express');
const serviceValidation = require('../../../validations/services.validation');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const { adminValidate, artistValidate } = require('../../../middlewares/userValidate');
const validate = require('../../../middlewares/validate');
const { artistValidation } = require('../../../validations');

const router = express.Router();

router.get(
  '/:adminId/get-all-artists',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(serviceValidation.getArtists),
  superAdminControllers.infoController.getAllArtist
);
router.get(
  '/:adminId/:artistId/get-artist-info',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(serviceValidation.getArts),
  superAdminControllers.infoController.getArtistInfo
);
router.get(
  '/:adminId/:artistId/get-all-arts',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(serviceValidation.getArts),
  superAdminControllers.infoController.getAllArts
);
router.get(
  '/:adminId/:artistId/:artId',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(serviceValidation.getSingleArt),
  superAdminControllers.infoController.getSingleArt
);

// Get reviews of single artist
router.get(
  '/reviews/:adminId/:artistId',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artistValidation.getReviewsForArtist),
  superAdminControllers.infoController.getAllReviews
);

module.exports = router;
