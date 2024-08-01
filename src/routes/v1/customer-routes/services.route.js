const express = require('express');
const validate = require('../../../middlewares/validate');
const { customerController } = require('../../../controllers');
const { customerValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { customerValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  auth(),
  customerValidate((req) => req.params.customerId),
  validate(customerValidation.getServices),
  customerController.getServicesController.getAllServices
);

module.exports = router;
