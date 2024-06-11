const express = require('express');
const { superAdminControllers } = require('../../../controllers');

const router = express.Router();

router.post('/transaction', superAdminControllers.webhookController.webhookTransaction);
router.post('/transaction/payout', superAdminControllers.webhookController.payoutWebhookTransaction);

module.exports = router;
