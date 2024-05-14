const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { artValidation, authValidation, vendorValidation } = require('../../../validations');
const { adminValidate } = require('../../../middlewares/userValidate');

const router = express.Router();

router.post(
  '/:adminId/:artistId/add-to-vendors-in-cf',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  // validate(vendorValidation.udpateArtStatus),
  superAdminControllers.vendorController.addVendorToCF
);

router.post(
  '/:adminId/:artistId/split',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(vendorValidation.vendorSplit),
  superAdminControllers.vendorController.splitPaymentToVendor
);

module.exports = router;
