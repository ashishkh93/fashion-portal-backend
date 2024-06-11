const express = require('express');
const validate = require('../../../middlewares/validate');
const { customerController } = require('../../../controllers');
const { customerValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { customerValidate } = require('../../../middlewares/userValidate');

const router = express.Router();

router.post(
  '/:customerId',
  auth(),
  customerValidate((req) => req.params.customerId),
  validate(customerValidation.addReview),
  customerController.reviewController.createReviewForOrder
);

router.get(
  '/:customerId/:orderId',
  auth(),
  customerValidate((req) => req.params.customerId),
  validate(customerValidation.getOrderReview),
  customerController.reviewController.getOrderReview
);

module.exports = router;
