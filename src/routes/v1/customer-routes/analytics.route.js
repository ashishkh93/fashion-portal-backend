const express = require('express');
const validate = require('../../../middlewares/validate');
const { customerController } = require('../../../controllers');
const { customerValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { customerValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true });

router.post(
  '/profile-visit-log',
  auth(),
  validate(customerValidation.artistProfileVisitLog),
  customerValidate((req) => req.params.customerId),
  customerController.analyticsController.createArtistProfileVisitLog
);

module.exports = router;
