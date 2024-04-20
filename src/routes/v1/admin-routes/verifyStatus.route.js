const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { artValidation, authValidation } = require('../../../validations');
const { adminValidate } = require('../../../middlewares/userValidate');

const router = express.Router();

router.put(
  '/:artistId/approve-artist',
  auth('manageArtists'),
  adminValidate,
  validate(authValidation.changeArtistStatus),
  superAdminControllers.verifyStatusController.changeArtistStatus
);
router.put(
  '/:artistId/:artId/approve-art',
  auth(),
  adminValidate,
  validate(artValidation.udpateArtStatus),
  superAdminControllers.verifyStatusController.approveArt
);

module.exports = router;
