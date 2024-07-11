const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { artValidation, authValidation, artistValidation } = require('../../../validations');
const { adminValidate } = require('../../../middlewares/userValidate');
const transactionMiddleware = require('../../../middlewares/transaction');

const router = express.Router();

router.patch(
  '/:adminId/:artistId/approve-artist',
  auth('manageArtists'),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(authValidation.changeArtistStatus),
  transactionMiddleware,
  superAdminControllers.verifyStatusController.changeArtistStatus
);
router.patch(
  '/:adminId/:artistId/:artId/approve-art',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artValidation.udpateArtStatus),
  superAdminControllers.verifyStatusController.approveArt
);
router.patch(
  '/:adminId/:artistId/update-lat-long',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artistValidation.updateLatLong),
  superAdminControllers.verifyStatusController.updateLatLong
);
router.get(
  '/:adminId/:artistId/upi',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artistValidation.verifyUpi),
  superAdminControllers.verifyStatusController.verifyUPI
);

module.exports = router;
