const express = require('express');
const validate = require('../../../middlewares/validate');
const { commonControllers } = require('../../../controllers');
const { notificationValidation } = require('../../../validations');
const auth = require('../../../middlewares/auth');
const { customerValidate } = require('../../../middlewares/userValidate');

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  auth(),
  validate(notificationValidation.getNotificationsForCustomer),
  customerValidate((req) => req.params.customerId),
  commonControllers.notificationController.getAllNotifications
);

router.patch(
  '/:notificationId',
  auth(),
  validate(notificationValidation.updateNotificationForCustomer),
  customerValidate((req) => req.params.customerId),
  commonControllers.notificationController.updateNotifiacation
);

module.exports = router;
