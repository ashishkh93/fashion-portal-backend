const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { artistControllers } = require('../../../controllers');
const { artistPaymentValidation } = require('../../../validations');
const { artistValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true });

/**
 * GET /:artistId/payment/dashboard
 * Returns payment dashboard: total income, last payment, pending amount, monthly chart
 */
router.get(
  '/dashboard',
  auth(),
  validate(artistPaymentValidation.getPaymentDashboard),
  artistValidate((req) => ({ artistId: req.params.artistId })),
  artistControllers.paymentController.getPaymentDashboard
);

/**
 * GET /:artistId/payment/history
 * Returns paginated payout transfer history with aggregate summary
 */
router.get(
  '/history',
  auth(),
  validate(artistPaymentValidation.getPaymentHistory),
  artistValidate((req) => ({ artistId: req.params.artistId })),
  artistControllers.paymentController.getPaymentHistory
);

/**
 * GET /:artistId/payment/history/:transferId
 * Returns datewise order breakdown for a specific payout transfer
 */
router.get(
  '/history/:transferId',
  auth(),
  validate(artistPaymentValidation.getTransferOrders),
  artistValidate((req) => ({ artistId: req.params.artistId })),
  artistControllers.paymentController.getTransferOrders
);

module.exports = router;
