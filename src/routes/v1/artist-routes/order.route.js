const express = require('express');
const validate = require('../../../middlewares/validate');
const { artistControllers } = require('../../../controllers');
const { orderValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { artistValidate } = require('../../../middlewares/userValidate');
const transactionMiddleware = require('../../../middlewares/transaction');

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  auth(),
  validate(orderValidation.getOrdersForArtist),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'order' })),
  artistControllers.orderController.getAllOrders
);

router
  .route('/:orderId')
  .get(
    auth(),
    validate(orderValidation.getSingleOrderForArtist),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'order' })),
    artistControllers.orderController.getSingleOrder
  )
  .patch(
    auth(),
    validate(orderValidation.updateOrderStatusForArtist),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'order' })),
    transactionMiddleware,
    artistControllers.orderController.updateOrderStatus
  );

router.patch(
  '/:orderId/edit-order',
  auth(),
  validate(orderValidation.discountAndAddAddOnAmountInOrder),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'order' })),
  artistControllers.orderController.addDiscountAndAddOnInOrder
);

module.exports = router;
