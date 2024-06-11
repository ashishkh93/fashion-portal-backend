const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { refundValidation } = require('../../../validations');
const { adminValidate } = require('../../../middlewares/userValidate');

const router = express.Router();

router.route('/:adminId/:orderId/:customerId').get(
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(refundValidation.initiateRefund),
  superAdminControllers.refundController.initiateRefund
);

router.get(
  '/:adminId/refund-requests',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(refundValidation.fetchRefundRequests),
  superAdminControllers.refundController.getRefundRequests
);

module.exports = router;
