const express = require('express');
const validate = require('../../../middlewares/validate');
const { customerController } = require('../../../controllers');
const { customerValidation, addressValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { customerValidate, customerInfoValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    auth(),
    validate(addressValidation.addAddress),
    customerValidate((req) => req.params.customerId),
    customerInfoValidate((req) => req.params.customerId),
    customerController.addressController.addAddress
  )
  .get(
    auth(),
    validate(addressValidation.getAllAddress),
    customerValidate((req) => req.params.customerId),
    customerController.addressController.getAllAddress
  );

router
  .route('/:addressId')
  // .get(
  //   auth(),
  //   validate(customerValidation.getCustomerInfo),
  //   customerValidate((req) => req.params.customerId),
  //   customerController.customerInfoController.getCustomerProfileStatus
  // )
  .patch(
    auth(),
    validate(addressValidation.editAddress),
    customerValidate((req) => req.params.customerId),
    customerController.addressController.editAddress
  );

module.exports = router;
