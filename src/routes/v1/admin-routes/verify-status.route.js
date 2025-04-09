const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { artValidation, authValidation, artistValidation, bankingValidation } = require('../../../validations');
const { adminValidate } = require('../../../middlewares/userValidate');
const transactionMiddleware = require('../../../middlewares/transaction');

const router = express.Router({ mergeParams: true });

router.patch(
  '/:artistId/update-artist-status',
  auth('manageArtists'),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(authValidation.changeArtistStatus),
  transactionMiddleware,
  superAdminControllers.verifyStatusController.changeArtistStatus
);
router.patch(
  '/:artistId/:artId/update-art-status',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artValidation.updateArtStatus),
  superAdminControllers.verifyStatusController.updateArtStatus
);
router.patch(
  '/:artistId/:artId/switch-art-state',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artValidation.switchArtState),
  superAdminControllers.verifyStatusController.switchArtState
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
  validate(bankingValidation.verifyUpi),
  superAdminControllers.verifyStatusController.verifyUPI
);
router.post(
  '/:artistId/pan',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(bankingValidation.verifyPAN),
  superAdminControllers.verifyStatusController.verifyPAN
);

// Customer
router.patch(
  '/:customerId/update-customer-status',
  auth('manageUsers'),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(authValidation.changeCustomerStatus),
  transactionMiddleware,
  superAdminControllers.verifyStatusController.changeCustomerStatus
);

module.exports = router;
