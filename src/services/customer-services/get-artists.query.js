const { getDistance } = require('geolib');
const { ArtistInfo, User, Review, Sequelize } = require('../../models');
const { getPagination, getPagingData } = require('../../utils/paginate');
const { Op } = require('sequelize');

module.exports = class GetFilteredArtists {
  /**
   * Get artists based on the provided filters
   * @param {number} page
   * @param {number} size
   * @param {object} filters
   */
  constructor(page, size, filters) {
    this.details = { page, size, ...filters };
  }

  async get() {
    let { page, size, latitude: userLat, longitude: userLong, minRating, services, maxDistance } = this.details;

    const { limit, offset } = getPagination(page, size);

    const newQuery = {
      attributes: [
        'artistId',
        [Sequelize.literal('"ArtistInfo"."fullName"'), 'fullName'],
        [Sequelize.literal('"ArtistInfo"."location"'), 'location'],
        [Sequelize.literal('"ArtistInfo"."latitude"'), 'latitude'],
        [Sequelize.literal('"ArtistInfo"."longitude"'), 'longitude'],
        [Sequelize.literal('"artist"."phone"'), 'phone'],
        /**
         * calclulating an average of review count for each artist
         */
        [
          Sequelize.literal(`COALESCE(
          (
            SELECT AVG("artistReview"."reviewCount")
            FROM "Reviews" AS "artistReview"
            WHERE "artistReview"."artistId" = "ArtistInfo"."artistId"
          ), 0)`),
          'averageRating',
        ],
      ],
      include: [
        {
          model: User,
          attributes: [],
          as: 'artist',
          required: true,
          duplicating: false,
        },
      ],
      order: [[Sequelize.literal('"averageRating"'), 'DESC']],
      where: {},
      limit,
      offset,
      raw: true,
    };

    // if (services) {
    //   if (typeof services !== 'object') {
    //     // if type of services is not an array, then converting it first to array
    //     services = [services];
    //   }
    //   query.where.services = {
    //     // [Op.in]: services, // Assuming services is stored as an array in the database
    //     [Op.overlap]: services, // Assuming services is stored as an array in the database
    //   };
    // }

    // if (minRating) {
    //   query.include.push({
    //     model: Review,
    //     attributes: [],
    //     duplicating: false,
    //   });
    //   query.having = Sequelize.where(Sequelize.fn('AVG', Sequelize.col('Review.reviewCount')), {
    //     [Op.gte]: minRating,
    //   });
    // }

    if (userLat && userLong) {
      userLat = parseFloat(userLat);
      userLong = parseFloat(userLong);

      // Fetch all artists to calculate distance if lat and long are provided
      const allArtists = await ArtistInfo.findAndCountAll(newQuery);

      let artistsWithPagination = getPagingData(allArtists, page, limit);

      const artistsWithDistance = artistsWithPagination.items
        ?.map((artist) => {
          const distance = getDistance(
            { latitude: userLat, longitude: userLong },
            { latitude: artist.latitude, longitude: artist.longitude }
          );
          return { ...artist, distance };
        })
        .filter((artist) => (maxDistance ? artist.distance <= maxDistance * 1000 : true)) // Filter by distance if maxDistance is provided
        .sort((a, b) => a.distance - b.distance); // Sort by distance

      return { ...artistsWithPagination, items: artistsWithDistance };
    } else {
      // If lat and long are not provided, return results sorted by creation time
      newQuery.order = [['createdAt', 'DESC']];
      const artists = await ArtistInfo.findAndCountAll(newQuery);
      let artistsWithPagination = getPagingData(artists, page, limit);
      return artistsWithPagination;
    }
  }
};
