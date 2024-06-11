const httpStatus = require('http-status');
const geolib = require('geolib');
const { ArtistInfo, User, Sequelize, Review } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPagination, getPagingData } = require('../../utils/paginate');
const { Op } = require('sequelize');
const GetFilteredArtists = require('./get-artists.query');

/**
 * ************* VERY IMPORTANT API CONTROLLER *************
 * Get filtered artists based on the applied filters
 * @param {number} page
 * @param {number} size
 * @param {object} body
 * @returns {object}
 */
// const getFilteredArtistsService = async (page, size, body) => {
//   try {
//     const { limit, offset } = getPagination(page, size);
//     const { latitude, longitude } = body;

//     let whereClause = { status: 'APPROVED' };

//     const allArtists = await ArtistInfo.findAndCountAll({
//       where: [whereClause],
//       attributes: {
//         exclude: ['beneficiaryId', 'bankName', 'upi'],
//       },
//       include: [
//         {
//           model: User,
//           as: 'artist',
//           attributes: ['phone'],
//         },
//       ],
//       order: [['createdAt', 'DESC']],
//       limit,
//       offset,
//     });

//     let artists = getPagingData(allArtists, page, limit);

//     /**
//      * First filter the artists who have latitude and longitude
//      */
//     let artistsWithDistances = artists.items?.filter((artist) => artist?.latitude && artist?.longitude);

//     /**
//      * then filter the artists who dont have latitude and longitude
//      */
//     let artistsWithoutLocation = artists.items?.filter((artist) => !artist?.latitude && !artist?.longitude);

//     if (latitude && longitude) {
//       /**
//        * here we are getting the distance of each artist from the given latitude and longitude with the help of geolib package, and that distace we are appending in artist's json
//        */
//       artistsWithDistances = artistsWithDistances?.map((artist) => {
//         const lat = parseFloat(latitude);
//         const long = parseFloat(longitude);

//         const distance = geolib.getDistance(
//           { latitude: lat, longitude: long },
//           { latitude: artist?.latitude, longitude: artist?.longitude }
//         );
//         return { ...artist.toJSON(), distance };
//       });

//       /**
//        * And here we are finally sorting the artists based on distance in context of provided latitude and longitude
//        */
//       artistsWithDistances?.sort((a, b) => a.distance - b.distance);
//     }

//     /**
//      * Here we are appending the aritsts who dont have latitude and longitude in the end of the array
//      */
//     return { ...artists, items: [...artistsWithDistances, ...artistsWithoutLocation] };
//   } catch (error) {
//     throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal server error');
//   }
// };

const getFilteredArtistsService = async (page, size, body) => {
  try {
    const getArtistsInstance = new GetFilteredArtists(page, size, body);
    const artists = await getArtistsInstance.get();
    return artists;
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal server error');
  }
};

module.exports = {
  getFilteredArtistsService,
};
