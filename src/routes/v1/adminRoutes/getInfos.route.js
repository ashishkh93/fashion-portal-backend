const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');

const router = express.Router();

router.get('/get-all-artists', auth(), superAdminControllers.infoController.getAllArtist);

module.exports = router;
