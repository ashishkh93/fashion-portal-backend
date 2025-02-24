const express = require('express');
const { commonControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');

const router = express.Router({ mergeParams: true });

router.route('/').get(auth(), commonControllers.servicesController.getAllServices);

module.exports = router;
