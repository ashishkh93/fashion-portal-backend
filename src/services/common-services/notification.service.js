const httpStatus = require('http-status');
const { FirebaseUser, User, ArtistInfo, CustomerInfo, Notification } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPaginationDataFromModel } = require('../../utils/paginate');

const getFcmTokens = (userId) => {
  return FirebaseUser.findAll({
    where: { userId },
    attributes: ['fcmToken'],
    raw: true,
  });
};

/**
 * Get all notifications for user
 * @param {string} userId
 * @param {object} req
 * @returns {Promise<Notification>}
 */
const getAllNotificationsService = async (req) => {
  const { page, size } = req.query;
  const user = req.user;

  const isArtist = user.role === 'artist';
  const modelToConsider = isArtist ? ArtistInfo : CustomerInfo;
  const alias = isArtist ? 'artistInfos' : 'customerInfo';

  const includeModel = [
    {
      model: User,
      as: 'user',
      attributes: ['phone'],
      include: [
        {
          model: modelToConsider,
          as: alias,
          attributes: ['status', 'fullName', 'profilePic', 'email'],
        },
      ],
    },
  ];

  const notCondition = { userId: user.id, isRead: false };
  const allArts = await getPaginationDataFromModel(Notification, notCondition, page, size, includeModel);
  return allArts;
};

/**
 * Update isRead OR other flag of notification
 * @param {object} req
 * @returns {Promise<Notification>}
 */
const updateNotificationService = async (req) => {
  const user = req.user;
  const notificationId = req.params.notificationId;
  const notification = await Notification.findOne({ where: { id: notificationId, userId: user.id } });

  if (!notification) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Notification not found.');
  }

  await notification.update(req.body);
};

/**
 * Mark all notifications as read for the authenticated user
 * @param {object} req
 * @returns {Promise<void>}
 */
const readAllNotificationsService = async (req) => {
  const user = req.user;
  await Notification.update({ isRead: true }, { where: { userId: user.id, isRead: false } });
};

module.exports = {
  getFcmTokens,
  getAllNotificationsService,
  updateNotificationService,
  readAllNotificationsService,
};
