const express = require('express');
const validate = require('../../../middlewares/validate');
const { customerController } = require('../../../controllers');
const { customerValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { customerValidate } = require('../../../middlewares/userValidate');

const router = express.Router();

router
  .route('/:customerId')
  .post(
    auth(),
    customerValidate((req) => req.params.customerId),
    validate(customerValidation.addCustomerInfo),
    customerController.customerInfoController.addCustomerInfo
  )
  .get(
    auth(),
    customerValidate((req) => req.params.customerId),
    validate(customerValidation.getCustomerInfo),
    customerController.customerInfoController.getCustomerInfo
  )
  .patch(
    auth(),
    customerValidate((req) => req.params.customerId),
    validate(customerValidation.editCustomerInfo),
    customerController.customerInfoController.editCustomerInfo
  );

module.exports = router;
