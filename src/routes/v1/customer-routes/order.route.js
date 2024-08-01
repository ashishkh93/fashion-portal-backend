const express = require('express');
const validate = require('../../../middlewares/validate');
const { customerController } = require('../../../controllers');
const { orderValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { customerValidate } = require('../../../middlewares/userValidate');
const transactionMiddleware = require('../../../middlewares/transaction');

const router = express.Router({ mergeParams: true });

router.route('/:artistId').post(
  auth(),
  validate(orderValidation.orderInitiate),
  customerValidate((req) => req.params.customerId),
  transactionMiddleware,
  customerController.orderController.orderInitiate
);

router
  .route('/:orderId')
  .get(
    auth(),
    validate(orderValidation.getOrderForUser),
    customerValidate((req) => req.params.customerId),
    customerController.orderController.fetchOrder
  )
  .patch(
    auth(),
    validate(orderValidation.cancelOrderByUser),
    customerValidate((req) => req.params.customerId),
    transactionMiddleware,
    customerController.orderController.cancelOrderByUser
  );

router.get(
  '/',
  auth(),
  validate(orderValidation.getOrdersForUser),
  customerValidate((req) => req.params.customerId),
  customerController.orderController.fetchOrders
);

module.exports = router;
