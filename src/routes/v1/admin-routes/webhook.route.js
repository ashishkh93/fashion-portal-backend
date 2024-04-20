const express = require('express');
const { superAdminControllers } = require('../../../controllers');

const router = express.Router();

router.post('/transaction', superAdminControllers.webhookController.webhookTransaction);

module.exports = router;
