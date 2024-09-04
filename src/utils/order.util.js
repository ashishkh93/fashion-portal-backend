const config = require('../config/config');
const { Order } = require('../models');

const getNumberOfImagesArtistCanUpload = async (artistId) => {
  const defaultRecentWorkImagesLimit = config.defaultRecentWorkImagesLimit;
  const perOrderRecentWorkImagesLimit = config.perOrderRecentWorkImagesLimit;
  const completedOrdersCount = await Order.count({ where: { artistId, status: 'COMPLETED' } });

  const numberOfImagesArtistCanUpload = completedOrdersCount * perOrderRecentWorkImagesLimit + defaultRecentWorkImagesLimit;

  return numberOfImagesArtistCanUpload;
};

module.exports = { getNumberOfImagesArtistCanUpload };
