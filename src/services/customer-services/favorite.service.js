const httpStatus = require('http-status');
const { FavoriteArtist, ArtistInfo, Service, Review, Sequelize } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getApprovedArtistByStatus } = require('./review.service');
const { getAverageRatingOfArtistRawQuery } = require('../../utils/common.util');

/**
 * Add OR remove favortie artist for the customer
 * @param {string} customerId
 * @param {object} body
 * @param {object} res
 * @returns {FavoriteArtist}
 */
const addOrRemoveFavoriteService = async (customerId, body, res) => {
  await getApprovedArtistByStatus(body.artistId);
  const favArtist = await FavoriteArtist.findOne({ where: { customerId, artistId: body.artistId } });

  if (!favArtist) {
    const favBody = { customerId, artistId: body.artistId };
    const favResp = await FavoriteArtist.create(favBody);
    res.status(httpStatus.CREATED).send({ status: true, message: 'Artist added in your favorite list!', entity: favResp });
  } else {
    await favArtist.destroy();
    res.status(httpStatus.CREATED).send({ status: true, message: 'Artist removed from your favorite list!' });
  }
};

/**
 * Get all fav artists for the customer
 * @param {string} customerId
 * @returns
 */
const getAllAFavArtistsService = async (customerId) => {
  const include = [
    {
      model: ArtistInfo,
      as: 'artist',
      attributes: [
        'fullName',
        'artistId',
        'businessName',
        'profilePic',
        [Sequelize.literal(getAverageRatingOfArtistRawQuery('artist')), 'averageRating'],
      ],
      include: [
        {
          model: Service,
          as: 'artistServices',
          attributes: ['name'],
          through: { attributes: [] },
        },
      ],
    },
  ];
  const favArtists = await FavoriteArtist.findAll({
    where: { customerId },
    include,
    order: [['createdAt', 'DESC']],
  });
  return favArtists;
};

module.exports = {
  addOrRemoveFavoriteService,
  getAllAFavArtistsService,
};
