const express = require('express');
const { commonControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');

const router = express.Router({ mergeParams: true });

router.route('/').get(auth(), commonControllers.catController.getAllCategories);

module.exports = router;
