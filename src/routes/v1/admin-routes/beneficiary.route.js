const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { beneficiaryValidation } = require('../../../validations');
const { adminValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true });

router.route('/:artistId').post(
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(beneficiaryValidation.addBeneficiary),
  superAdminControllers.beneficiaryController.addBeneToCF
);

module.exports = router;
