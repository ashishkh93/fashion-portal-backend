const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const { adminValidate } = require('../../../middlewares/userValidate');

const router = express.Router();

router.get('/get-all-artists', auth(), adminValidate, superAdminControllers.infoController.getAllArtist);
router.get('/:artistId/get-artist-info', auth(), adminValidate, superAdminControllers.infoController.getArtistInfo);
router.get('/:artistId/get-all-arts', auth(), adminValidate, superAdminControllers.infoController.getAllArts);
router.get('/:artistId/:artId', auth(), adminValidate, superAdminControllers.infoController.getSingleArt);

module.exports = router;
