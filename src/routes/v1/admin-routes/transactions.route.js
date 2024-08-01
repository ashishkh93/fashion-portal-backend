const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const { adminValidate } = require('../../../middlewares/userValidate');
const validate = require('../../../middlewares/validate');
const { artistValidation, orderValidation, transactionsValidation } = require('../../../validations');

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
  validate(artistValidation.getReviewsForSingleArtist),
  superAdminControllers.orderController.getAllOrdersForSingleArtist
);

module.exports = router;
