const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { artValidation } = require('../../../validations');

const router = express.Router();

router.get('/get-all-artists', auth(), superAdminControllers.infoController.getAllArtist);
router.get('/:artistId/get-artist-info', auth(), superAdminControllers.infoController.getArtistInfo);
router.get('/:artistId/get-all-arts', auth(), superAdminControllers.infoController.getAllArts);

module.exports = router;
