const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const { adminValidate } = require('../../../middlewares/userValidate');
const validate = require('../../../middlewares/validate');
const { transactionsValidation } = require('../../../validations');

const router = express.Router({ mergeParams: true });

router.get(
  '/customer/:customerId',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(transactionsValidation.getTransactionsForCustomersInAdmin),
  superAdminControllers.transactionsController.getAllTransactionForCustomer
);
router.get(
  '/artist/:artistId',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(transactionsValidation.getTransactionsForArtistInAdmin),
  superAdminControllers.transactionsController.getAllTransactionForArtist
);

module.exports = router;
