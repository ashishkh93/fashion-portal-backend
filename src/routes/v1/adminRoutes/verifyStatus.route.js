const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { artValidation, authValidation } = require('../../../validations');

const router = express.Router();

router.put(
  '/:artistId/change-artist-status',
  auth('manageArtists'),
  validate(authValidation.changeArtistStatus),
  superAdminControllers.verifyStatusController.changeArtistStatus
);
router.put(
  '/:artistId/:artId/approve-art',
  auth(),
  validate(artValidation.udpateArtStatus),
  superAdminControllers.verifyStatusController.approveArt
);

module.exports = router;
