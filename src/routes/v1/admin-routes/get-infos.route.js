const express = require('express');
const serviceValidation = require('../../../validations/services.validation');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const { adminValidate, artistValidate } = require('../../../middlewares/userValidate');
const validate = require('../../../middlewares/validate');
const { artistValidation } = require('../../../validations');

const router = express.Router({ mergeParams: true });

router.get(
  '/get-all-artists',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artistValidation.getArtists),
  superAdminControllers.infoController.getAllArtist
);

router.get(
  '/arts',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(serviceValidation.getAllArtsArts),
  superAdminControllers.infoController.getAllArts
);

router.get(
  '/get-all-customers',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artistValidation.getCustomers),
  superAdminControllers.infoController.getAllCustomers
);

router.get(
  '/:artistId/get-artist-info',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(serviceValidation.getSingleArtist),
  superAdminControllers.infoController.getArtistInfo
);

router.get(
  '/:artistId/get-all-arts',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(serviceValidation.getArtsForSingleArtist),
  superAdminControllers.infoController.getAllArtsForSingleArtist
);

router.get(
  '/:customerId/customer-info',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(serviceValidation.getSingleCustomer),
  superAdminControllers.infoController.getCustomerInfo
);

router.get(
  '/:artistId/:artId',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(serviceValidation.getSingleArt),
  superAdminControllers.infoController.getSingleArt
);

module.exports = router;
