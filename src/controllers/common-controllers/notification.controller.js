const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { commonServices } = require('../../services');

exports.getAllNotifications = catchAsync(async (req, res) => {
  const allNotifications = await commonServices.notificationService.getAllNotificationsService(req);
  res.status(httpStatus.OK).send({ status: true, message: 'Notification fetched!', entity: allNotifications });
});

exports.updateNotifiacation = catchAsync(async (req, res) => {
  await commonServices.notificationService.updateNotificationService(req);
  res.status(httpStatus.OK).send({ status: true, message: 'Notification updated!' });
});

exports.readAllNotifications = catchAsync(async (req, res) => {
  await commonServices.notificationService.readAllNotificationsService(req);
  res.status(httpStatus.OK).send({ status: true, message: 'All notifications marked as read!' });
});
