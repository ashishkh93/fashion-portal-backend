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
  validate(orderValidation.orderInitiate),
  customerController.orderController.orderInitiate
);

router
  .route('/:customerId/:orderId')
  .get(
    auth(),
    customerValidate((req) => req.params.customerId),
    validate(orderValidation.getOrderForUser),
    customerController.orderController.fetchOrder
  )
  .put(
    auth(),
    customerValidate((req) => req.params.customerId),
    validate(orderValidation.cancelOrderByUser),
    customerController.orderController.cancelOrderByUser
  );

router.get(
  '/:customerId',
  auth(),
  customerValidate((req) => req.params.customerId),
  validate(orderValidation.getOrdersForUser),
  customerController.orderController.fetchOrders
);

module.exports = router;
