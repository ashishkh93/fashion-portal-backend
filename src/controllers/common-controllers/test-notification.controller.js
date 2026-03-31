const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { FirebaseAdminUtil } = require('../../utils/firebase-admin.util');

exports.sendTestNotification = catchAsync(async (req, res) => {
  const { fcmToken, title, body, imageUrl, data = {} } = req.body;

  const firebase = new FirebaseAdminUtil();
  const admin = firebase.fb_admin;

  const message = {
    notification: {
      title,
      body,
      ...(imageUrl && { imageUrl }),
    },
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    token: fcmToken,
  };

  const result = await admin.messaging().send(message);

  res.status(httpStatus.OK).send({
    status: true,
    message: 'Test notification sent successfully!',
    entity: { messageId: result },
  });
});
