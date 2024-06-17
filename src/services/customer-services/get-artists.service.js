const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const GetFilteredArtists = require('./get-artists.query');
const { ArtistInfo, User, Service, Art, Sequelize } = require('../../models');

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

//     const allArtists = await ArtifstInfo.findAndCountAll({
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

/**
 * Get single artist by id
 * @param {string} artistId
 * @returns
 */
const getSingleArtistService = async (artistId) => {
  try {
    const include = [
      {
        model: User,
        as: 'artist',
        attributes: [], // No attributes needed from User
      },
      {
        model: Service,
        as: 'artistServices',
        attributes: ['id', 'name'],
        through: {
          attributes: [], // No attributes needed from the join table
        },
      },
      {
        model: Art,
        where: { status: 'APPROVED' },
        as: 'arts',
        attributes: ['name', 'description', 'images', 'price', 'advanceAmount', 'timeToCompleteInMinutes', 'renderIndex'],
        order: [['renderIndex', 'ASC']],
      },
    ];

    const artistQuery = {
      where: { artistId, status: 'APPROVED' },
      attributes: [
        'fullName',
        'businessName',
        'gender',
        'profilePic',
        'aboutInfo',
        'recentWorkImages',
        'workingTime',
        'location',
        'latitude',
        'longitude',
        [Sequelize.literal('"artist"."phone"'), 'phone'],
        [Sequelize.literal('"artist"."createdAt"'), 'createdAt'],
      ],
      include,
      order: [[{ model: Art, as: 'arts' }, 'renderIndex', 'ASC']],
      // raw: true,
    };

    const artist = await ArtistInfo.findOne(artistQuery);
    if (artist) {
      return artist;
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Artist not found');
    }
  } catch (error) {
    console.error('Error fetching artist:', error);
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal server error');
  }
};

module.exports = {
  getFilteredArtistsService,
  getSingleArtistService,
};
