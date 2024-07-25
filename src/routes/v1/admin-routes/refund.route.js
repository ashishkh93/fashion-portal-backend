const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { refundValidation } = require('../../../validations');
const { adminValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true });

router.get(
  '/:orderId/:customerId',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(refundValidation.initiateRefund),
  superAdminControllers.refundController.initiateRefund
);

router.get(
  '/requests',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(refundValidation.fetchRefundRequests),
  superAdminControllers.refundController.getRefundRequests
);

module.exports = router;
