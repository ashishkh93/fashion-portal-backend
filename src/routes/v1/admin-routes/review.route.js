const express = require('express');
const { superAdminControllers } = require('../../../controllers');
const auth = require('../../../middlewares/auth');
const { adminValidate } = require('../../../middlewares/userValidate');
const validate = require('../../../middlewares/validate');
const { artistValidation } = require('../../../validations');

const router = express.Router();

// Get reviews of single artist
router.get(
  '/:adminId/:artistId/artist',
  auth(),
  adminValidate((req) => ({ superAdminId: req.params.adminId })),
  validate(artistValidation.getReviewsForArtist),
  superAdminControllers.infoController.getAllReviews
);

module.exports = router;
