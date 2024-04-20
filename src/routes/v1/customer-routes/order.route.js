const express = require('express');
const validate = require('../../../middlewares/validate');
const { customerController } = require('../../../controllers');
const { orderValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { customerValidate } = require('../../../middlewares/userValidate');

const router = express.Router();

router.route('/:customerId/:artistId').post(
  auth(),
  customerValidate((req) => req.params.customerId),
  validate(orderValidation.orderInitate),
  customerController.orderController.orderInitate
);

router.route('/payment/:customerId/:orderId').post(
  auth(),
  customerValidate((req) => req.params.customerId),
  validate(orderValidation.orderInitate),
  customerController.orderController.orderInitate
);

module.exports = router;
