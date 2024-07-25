const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { beneficiaryValidation } = require('../../../validations');
const { adminValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true }); // this will merge the params from parent routes, it means, from router.use method

router
  .route('/')
  .post(
    validate(beneficiaryValidation.payout), // need to add rights to body to access it
    (req, res, next) => auth(req.body.rights)(req, res, next),
    adminValidate((req) => ({ superAdminId: req.params.adminId })),
    superAdminControllers.payoutController.payoutToArtists
  )
  .get(
    auth(),
    adminValidate((req) => ({ superAdminId: req.params.adminId })),
    validate(beneficiaryValidation.getAllPayouts),
    superAdminControllers.payoutController.getAllPayouts
  );

router.get(
  '/verify/:batchTransferId',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(beneficiaryValidation.payoutVerify),
  superAdminControllers.payoutController.verifyPayout
);

module.exports = router;
