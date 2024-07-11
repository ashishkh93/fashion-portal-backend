const express = require('express');
const validate = require('../../../middlewares/validate');
const { artistControllers } = require('../../../controllers');
const { orderValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { artistValidate } = require('../../../middlewares/userValidate');
const transactionMiddleware = require('../../../middlewares/transaction');

const router = express.Router();

router.get(
  '/:artistId',
  auth(),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'order' })),
  validate(orderValidation.getOrdersForArtist),
  artistControllers.orderController.getAllOrders
);

router
  .route('/:artistId/:orderId')
  .get(
    auth(),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'order' })),
    validate(orderValidation.getSingleOrderForArtist),
    artistControllers.orderController.getSingleOrder
  )
  .patch(
    auth(),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'order' })),
    validate(orderValidation.updateOrderStatusForArtist),
    transactionMiddleware,
    artistControllers.orderController.updateOrderStatus
  );

router.patch(
  '/:artistId/:orderId/edit-order',
  auth(),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'order' })),
  validate(orderValidation.discountAndAddAddOnAmountInOrder),
  artistControllers.orderController.addDiscountAndAddOnInOrder
);

module.exports = router;
