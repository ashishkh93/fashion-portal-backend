const { Op } = require('sequelize');
const { ArtistInfo, User, Sequelize } = require('../../models');
const { getPagination, getPagingData } = require('../../utils/paginate');
const { getAverageRatingOfArtistRawQuery } = require('../../utils/common.util');

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

  // async get() {
  //   let { page, size, latitude: userLat, longitude: userLong, minRating, services, maxDistance } = this.details;

  //   const { limit, offset } = getPagination(page, size);

  //   const newQuery = {
  //     attributes: [
  //       'artistId',
  //       [Sequelize.literal('"ArtistInfo"."fullName"'), 'fullName'],
  //       [Sequelize.literal('"artist"."role"'), 'role'],
  //       [Sequelize.literal('"ArtistInfo"."location"'), 'location'],
  //       [Sequelize.literal('"ArtistInfo"."latitude"'), 'latitude'],
  //       [Sequelize.literal('"ArtistInfo"."longitude"'), 'longitude'],
  //       [Sequelize.literal('"artist"."phone"'), 'phone'],
  //       /**
  //        * calclulating an average of review count for each artist
  //        */
  //       [
  //         Sequelize.literal(`COALESCE(
  //         (
  //           SELECT AVG("artistReview"."reviewCount")
  //           FROM "Reviews" AS "artistReview"
  //           WHERE "artistReview"."artistId" = "ArtistInfo"."artistId"
  //         ), 0)`),
  //         'averageRating',
  //       ],
  //     ],
  //     include: [
  //       {
  //         model: User,
  //         attributes: [],
  //         as: 'artist',
  //         required: true,
  //         duplicating: false,
  //       },
  //     ],
  //     order: [[Sequelize.literal('"averageRating"'), 'DESC']],
  //     where: {},
  //     limit,
  //     offset,
  //     raw: true,
  //   };

  //   // if (services) {
  //   //   if (typeof services !== 'object') {
  //   //     // if type of services is not an array, then converting it first to array
  //   //     services = [services];
  //   //   }
  //   //   query.where.services = {
  //   //     // [Op.in]: services, // Assuming services is stored as an array in the database
  //   //     [Op.overlap]: services, // Assuming services is stored as an array in the database
  //   //   };
  //   // }

  //   // if (minRating) {
  //   //   query.include.push({
  //   //     model: Review,
  //   //     attributes: [],
  //   //     duplicating: false,
  //   //   });
  //   //   query.having = Sequelize.where(Sequelize.fn('AVG', Sequelize.col('Review.reviewCount')), {
  //   //     [Op.gte]: minRating,
  //   //   });
  //   // }

  //   if (userLat && userLong) {
  //     userLat = parseFloat(userLat);
  //     userLong = parseFloat(userLong);

  //     // Fetch all artists to calculate distance if lat and long are provided
  //     const allArtists = await ArtistInfo.findAndCountAll(newQuery);

  //     let artistsWithPagination = getPagingData(allArtists, page, limit);

  //     const artistsWithDistance = artistsWithPagination.items
  //       ?.map((artist) => {
  //         const distance = getDistance(
  //           { latitude: userLat, longitude: userLong },
  //           { latitude: artist.latitude, longitude: artist.longitude }
  //         );
  //         return { ...artist, distance };
  //       })
  //       .filter((artist) => (maxDistance ? artist.distance <= maxDistance * 1000 : true)) // Filter by distance if maxDistance is provided
  //       .sort((a, b) => a.distance - b.distance); // Sort by distance

  //     return { ...artistsWithPagination, items: artistsWithDistance };
  //   } else {
  //     // If lat and long are not provided, return results sorted by creation time
  //     newQuery.order = [['createdAt', 'DESC']];
  //     const artists = await ArtistInfo.findAndCountAll(newQuery);
  //     let artistsWithPagination = getPagingData(artists, page, limit);
  //     return artistsWithPagination;
  //   }
  // }

  async get() {
    let { page, size, latitude: userLat, longitude: userLong, minRating, services, maxDistance } = this.details;

    const { limit, offset } = getPagination(page, size);

    let locationFilter = 'true';
    if (userLat && userLong) {
      userLat = parseFloat(userLat);
      userLong = parseFloat(userLong);

      locationFilter = this.getDistanceInKmFromLatLong(userLat, userLong);

      if (maxDistance) {
        locationFilter += ` <= ${maxDistance}`;
      } else {
        locationFilter = 'true'; // No distance constraint if maxDistance is not provided
      }
    }

    const ratingFilter = minRating
      ? `
      (
        SELECT AVG("artistReview"."reviewCount")
        FROM "Reviews" AS "artistReview"
        WHERE "artistReview"."artistId" = "ArtistInfo"."artistId"
      ) >= ${minRating}
    `
      : 'true';

    // to add all attributes from model, and then append extra ones as below in query
    // const attributes = Object.keys(ArtistInfo.rawAttributes);

    const query = {
      attributes: [
        'artistId',
        [Sequelize.literal('"ArtistInfo"."fullName"'), 'fullName'],
        [Sequelize.literal('"artist"."role"'), 'role'],
        [Sequelize.literal('"ArtistInfo"."location"'), 'location'],
        [Sequelize.literal('"ArtistInfo"."city"'), 'city'],
        [Sequelize.literal('"ArtistInfo"."state"'), 'state'],
        [Sequelize.literal('"ArtistInfo"."country"'), 'country'],
        [Sequelize.literal('"ArtistInfo"."latitude"'), 'latitude'],
        [Sequelize.literal('"ArtistInfo"."longitude"'), 'longitude'],
        [Sequelize.literal('"ArtistInfo"."status"'), 'status'],
        [Sequelize.literal('"ArtistInfo"."services"'), 'services'],
        [Sequelize.literal('"ArtistInfo"."createdAt"'), 'createdAt'],
        [Sequelize.literal('"artist"."phone"'), 'phone'],
        [Sequelize.literal(getAverageRatingOfArtistRawQuery()), 'averageRating'],
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
      // where: Sequelize.and({ status: 'APPROVED' }, Sequelize.literal(locationFilter), Sequelize.literal(ratingFilter)),
      where: {
        status: 'APPROVED',
        [Op.and]: [Sequelize.literal(locationFilter), Sequelize.literal(ratingFilter)],
      },
      order: [],
      limit,
      offset,
      raw: true,
    };

    if (userLat && userLong) {
      /**
       * Get the distance of each Artist in Km from user's latitude and longitude
       */
      const distance = this.getDistanceInKmFromLatLong(userLat, userLong);
      let distanceAttr = [Sequelize.literal(distance), 'distance'];
      query.attributes.push(distanceAttr);

      const orderByDistanceCondition = [Sequelize.literal('"distance"'), 'ASC'];
      query.order.push(orderByDistanceCondition);
    } else {
      /**
       * If no lat long provided from user, then order the artists by createdAt time
       */
      query.order.push(['createdAt', 'DESC']);
    }

    if (minRating) {
      const orderByMinRatingCondition = [Sequelize.literal('"averageRating"'), 'DESC'];
      query.order.push(orderByMinRatingCondition);
    }

    if (services) {
      query.where.services = {
        [Op.overlap]: services, // Assuming services is stored as an array in the database
      };
    }

    const artists = await ArtistInfo.findAndCountAll(query);
    const paginatedArtists = getPagingData(artists, page, limit);
    return paginatedArtists;
  }

  /**
   * Haversine Formula to calculate the distance between the user's location and
   * the artist's location
   */
  getDistanceInKmFromLatLong(latitude, longitude) {
    return `6371 * acos(
        cos(radians(${latitude})) *
        cos(radians("ArtistInfo"."latitude")) *
        cos(radians("ArtistInfo"."longitude") - radians(${longitude})) +
        sin(radians(${latitude})) *
        sin(radians("ArtistInfo"."latitude"))
      )`;
  }
};
