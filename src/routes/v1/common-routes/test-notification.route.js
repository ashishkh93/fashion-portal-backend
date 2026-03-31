const express = require('express');
const Joi = require('joi');
const validate = require('../../../middlewares/validate');
const { testNotificationController } = require('../../../controllers/common-controllers');

const router = express.Router();

const sendTestNotificationSchema = {
  body: Joi.object({
    fcmToken: Joi.string().required(),
    title: Joi.string().required(),
    body: Joi.string().required(),
    imageUrl: Joi.string().uri().optional(),
    data: Joi.object().pattern(Joi.string(), Joi.any()).optional(),
  }),
};

router.post('/send', validate(sendTestNotificationSchema), testNotificationController.sendTestNotification);

module.exports = router;
