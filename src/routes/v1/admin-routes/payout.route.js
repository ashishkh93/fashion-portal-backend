const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { beneficiaryValidation } = require('../../../validations');
const { adminValidate } = require('../../../middlewares/userValidate');

const router = express.Router();

router.route('/:adminId').post(
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(beneficiaryValidation.payout),
  superAdminControllers.payoutController.payoutToArtists
);

router.get(
  '/:adminId/:batchPayoutId',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(beneficiaryValidation.payoutVerify),
  superAdminControllers.payoutController.verifyPayout
);

module.exports = router;
