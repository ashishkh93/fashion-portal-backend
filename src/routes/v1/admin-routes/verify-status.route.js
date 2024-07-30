const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { artValidation, authValidation, artistValidation } = require('../../../validations');
const { adminValidate } = require('../../../middlewares/userValidate');
const transactionMiddleware = require('../../../middlewares/transaction');

const router = express.Router({ mergeParams: true });

router.patch(
  '/:artistId/approve-artist',
  auth('manageArtists'),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(authValidation.changeArtistStatus),
  transactionMiddleware,
  superAdminControllers.verifyStatusController.changeArtistStatus
);
router.patch(
  '/:artistId/:artId/approve-art',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artValidation.udpateArtStatus),
  superAdminControllers.verifyStatusController.approveArt
);
router.patch(
  '/:artistId/update-lat-long',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artistValidation.updateLatLong),
  superAdminControllers.verifyStatusController.updateLatLong
);
router.get(
  '/:artistId/upi',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artistValidation.verifyUpi),
  superAdminControllers.verifyStatusController.verifyUPI
);
router.post(
  '/:artistId/pan',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artistValidation.verifyPAN),
  superAdminControllers.verifyStatusController.verifyPAN
);

module.exports = router;
