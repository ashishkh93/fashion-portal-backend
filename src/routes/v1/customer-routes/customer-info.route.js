const express = require('express');
const validate = require('../../../middlewares/validate');
const { customerController } = require('../../../controllers');
const { customerValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { customerValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    auth(),
    validate(customerValidation.addCustomerInfo),
    customerValidate((req) => req.params.customerId),
    customerController.customerInfoController.addCustomerInfo
  )
  .get(
    auth(),
    validate(customerValidation.getCustomerInfo),
    customerValidate((req) => req.params.customerId),
    customerController.customerInfoController.getCustomerInfo
  )
  .patch(
    auth(),
    validate(customerValidation.editCustomerInfo),
    customerValidate((req) => req.params.customerId),
    customerController.customerInfoController.editCustomerInfo
  );

module.exports = router;
