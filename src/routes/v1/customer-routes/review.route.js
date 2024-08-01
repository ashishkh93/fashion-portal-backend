const express = require('express');
const validate = require('../../../middlewares/validate');
const { customerController } = require('../../../controllers');
const { customerValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { customerValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true });

router
  .route('/:orderId')
  .post(
    auth(),
    customerValidate((req) => req.params.customerId),
    validate(customerValidation.addReview),
    customerController.reviewController.createReviewForOrder
  )
  .get(
    auth(),
    customerValidate((req) => req.params.customerId),
    validate(customerValidation.getOrderReview),
    customerController.reviewController.getOrderReview
  )
  .patch(
    auth(),
    customerValidate((req) => req.params.customerId),
    validate(customerValidation.addReview),
    customerController.reviewController.updateReviewForOrder
  );

module.exports = router;
