const express = require('express');
const validate = require('../../../middlewares/validate');
const { artistControllers, commonControllers } = require('../../../controllers');
const { notificationValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { artistValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  auth(),
  validate(notificationValidation.getNotificationsForArtist),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'notification' })),
  commonControllers.notificationController.getAllNotifications
);

router.patch(
  '/:notificationId',
  auth(),
  validate(notificationValidation.updateNotificationForArtist),
  artistValidate((req) => ({ artistId: req.params.artistId, route: 'notification' })),
  commonControllers.notificationController.updateNotifiacation
);

module.exports = router;
