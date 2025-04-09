const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const { adminValidate } = require('../../../middlewares/userValidate');
const validate = require('../../../middlewares/validate');
const { artistValidation, customerValidation } = require('../../../validations');

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artistValidation.getAllReviews),
  superAdminControllers.reviewController.getAllReviews
);
router.get(
  '/artist/:artistId',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artistValidation.getReviewsForSingleArtist),
  superAdminControllers.reviewController.getAllArtistReviews
);
router.get(
  '/customer/:customerId',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(customerValidation.getReviewsForSingleCustomer),
  superAdminControllers.reviewController.getAllCustomerReviews
);

module.exports = router;
