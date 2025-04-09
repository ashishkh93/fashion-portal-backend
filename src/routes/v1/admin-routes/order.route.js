const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const { adminValidate } = require('../../../middlewares/userValidate');
const validate = require('../../../middlewares/validate');
const { artistValidation, orderValidation } = require('../../../validations');

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artistValidation.getAllOrdersForAdmin),
  superAdminControllers.orderController.getAllOrders
);
router.get(
  '/artist/:artistId',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artistValidation.getOrdersForSingleArtist),
  superAdminControllers.orderController.getAllOrdersForSingleArtist
);
router.get(
  '/customer/:customerId',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artistValidation.getOrdersForSingleCustomer),
  superAdminControllers.orderController.getAllOrdersForSingleCustomer
);

// Get single entity
router.get(
  '/:orderId',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(orderValidation.getSingleOrderInAdmin),
  superAdminControllers.orderController.getSingleOrderByOrderId
);

module.exports = router;
