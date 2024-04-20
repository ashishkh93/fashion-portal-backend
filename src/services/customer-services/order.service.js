const httpStatus = require('http-status');
const { User, Order, ArtOrder, Art } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getApprovedArtist } = require('../artist-services/artist.service');
const { Op } = require('sequelize');

/**
 * Order Initiate service
 * @param {string} customerId
 * @param {string} artistId
 * @param {object} body
 * @param {User} customer
 * @returns {object}
 */
const orderInitiateService = async (customerId, artistId, body, customer) => {
  const artist = await getApprovedArtist(artistId);

  if (artist.phone === customer.phone) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot create an order for your self');
  } else {
    const existOrder = await Order.findOne({ where: { customerId, artistId, status: 'pending' } });
    if (existOrder) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'You have already initiated order request for this artist, please be patient untill he/she accept the current order!'
      );
    } else {
      const allArts = await Art.findAll({
        where: {
          id: {
            [Op.in]: body.artIds,
          },
        },
      });

      const totalAmount = allArts?.reduce((acc, art) => {
        return acc + Number(art.price);
      }, 0);

      const advanceAmountForOrder = allArts?.reduce((acc, art) => {
        return acc + Number(art.advanceAmount);
      }, 0);

      const orderInitiateBody = { ...body, customerId, artistId, totalAmount, advanceAmountForOrder };
      let tmpOrder = await Order.create(orderInitiateBody);

      const artOrdereEntries = body?.artIds?.map((artId) => ({
        artOrderId: tmpOrder.dataValues.id,
        artId,
      }));

      await ArtOrder.bulkCreate(artOrdereEntries);

      const { id, status, createdAt } = tmpOrder.dataValues;
      return { id, customerId, artistId, status, createdAt };
    }
  }
};

module.exports = {
  orderInitiateService,
};
