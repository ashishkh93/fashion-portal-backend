const express = require('express');
const validate = require('../../../middlewares/validate');
const { customerController } = require('../../../controllers');
const { paymentValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { customerValidate } = require('../../../middlewares/userValidate');

const router = express.Router();

router
  .route('/:customerId/:orderId')
  .post(
    auth(),
    customerValidate((req) => req.params.customerId),
    validate(paymentValidation.paymentInitate),
    customerController.paymentController.paymentInitiate
  )
  .get(
    auth(),
    customerValidate((req) => req.params.customerId),
    validate(paymentValidation.paymentVerify),
    customerController.paymentController.getPaymentOrder
  );

router.post(
  '/verify/:customerId/:cfOrderId',
  auth(),
  customerValidate((req) => req.params.customerId),
  validate(paymentValidation.paymentVerify),
  customerController.paymentController.paymentVerify
);

router.get(
  '/:customerId/:cfOrderId/:cfPaymentId',
  auth(),
  customerValidate((req) => req.params.customerId),
  validate(paymentValidation.getPayment),
  customerController.paymentController.getSinglePaymentFromCFOrderId
);

module.exports = router;
