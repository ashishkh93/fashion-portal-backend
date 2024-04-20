const express = require('express');
const validate = require('../../../middlewares/validate');
const { artistControllers } = require('../../../controllers');
const { orderValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { artistValidate } = require('../../../middlewares/userValidate');

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
  .put(
    auth(),
    artistValidate((req) => ({ artistId: req.params.artistId, route: 'order' })),
    validate(orderValidation.editOrderForArtist),
    artistControllers.orderController.updateOrderStatus
  );

module.exports = router;
