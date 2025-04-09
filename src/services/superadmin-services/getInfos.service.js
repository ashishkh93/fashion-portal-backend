const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { User, ArtistInfo, CustomerInfo, ArtistBankingInfo, Service, Category, Art, Sequelize } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPaginationDataFromModel } = require('../../utils/paginate');
const { verifyPANCallback, verifyUPICallbackV2 } = require('../../utils/cashfree-payout-api.util');
const { getPlainData } = require('../../utils/common.util');
const { getTransaction } = require('../../middlewares/asyncHooks');

const { GET_ALL_ARTS_SEARCH_QUERY, getPriceOrdeConfig } = require('../../search-queries/get-all-arts-search-query');
const { GET_ALL_CUSTOMERS_SEARCH_QUERY } = require('../../search-queries/get-all-customers-search-query');
const logger = require('../../config/logger');
const { GET_ALL_ARTISTS_SEARCH_QUERY } = require('../../search-queries/get-all-artists-search-query');

/**
 * Get artist information for admin to check artist's status
 * @param {string} artistId
 * @returns
 */
const getArtistForAdmin = async (artistId) => {
  const artist = await ArtistInfo.findOne({ where: { artistId } });
  if (artist) {
    return artist;
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'Artist not found');
  }
};

const getArtistServices = async (items) => {
  return Promise.all(
    items.map(async (artist) => {
      const plainArtist = getPlainData(artist);
      const serviceIds = plainArtist.artistInfos?.services ?? [];

      if (serviceIds?.length) {
        let services = await Service.findAll({
          where: {
            id: {
              [Op.in]: serviceIds,
            },
          },
          attributes: ['id', 'name'],
        });

        services = services.map((s) => getPlainData(s));

        return {
          ...plainArtist,
          artistInfos: plainArtist.artistInfos ? { ...plainArtist.artistInfos, services } : null,
        };
      }
      return plainArtist;
    })
  );
};

/**
 * Get all artists
 * @param {Object} query
 * @returns {User}
 */

const getAllArtistService = async (query) => {
  let { page, size, searchToken, status, startDate, endDate } = query;

  const includeModel = [
    {
      model: ArtistInfo,
      as: 'artistInfos',
      required: false,
      attributes: [
        'status',
        'fullName',
        'businessName',
        'email',
        'dob',
        'gender',
        'profilePic',
        'services',
        'businessProfilePic',
        'workingTime',
        'location',
        'pincode',
      ],
    },
  ];

  let artistCondition = { role: 'artist' };

  if (searchToken || status || (startDate && endDate)) {
    searchToken = searchToken && searchToken.trim();
    artistCondition = {
      ...artistCondition,
      ...GET_ALL_ARTISTS_SEARCH_QUERY(searchToken, status, startDate, endDate),
    };
  }

  const userAttributes = { exclude: ['fcmTokens', 'deletedAt'] };

  let allArtists = await getPaginationDataFromModel(User, artistCondition, page, size, includeModel, userAttributes);

  allArtists = {
    ...allArtists,
    items: await getArtistServices(allArtists.items),
  };

  return allArtists;
};

/**
 * Get single artist informations
 * @param {string} artistId
 * @returns {User}
 */
const getArtistInfoService = async (artistId) => {
  const artistCondoition = { id: artistId };
  const includeModel = [
    {
      model: ArtistInfo,
      as: 'artistInfos',
      required: false,
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'deletedAt', 'artistId', 'services', 'happyCustomerCount', 'userVisitedCount'],
      },
      include: [
        {
          model: ArtistBankingInfo,
          as: 'artistBankingInfo',
          attributes: ['beneficiaryId', 'upi'],
        },
        {
          model: Service,
          as: 'artistServices',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
          through: {
            attributes: [],
          },
        },
      ],
    },
  ];

  const userAttrs = ['id', 'phone', 'reasonToDecline'];

  let artistInfo = await User.findOne({
    where: [artistCondoition],
    attributes: userAttrs,
    include: includeModel,
  });

  if (artistInfo) {
    return getPlainData(artistInfo);
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'Artist not found');
  }
};
// const getArtistInfoService = async (artistId) => {
//   const artistCondoition = { artistId };
//   const includeModel = [
//     {
//       model: User,
//       as: 'artist',
//       required: true,
//       attributes: [],
//     },
//     {
//       model: ArtistBankingInfo,
//       as: 'artistBankingInfo',
//       attributes: ['beneficiaryId', 'upi'],
//     },
//     {
//       model: Service,
//       as: 'artistServices', // Ensure this matches the alias we used in association
//       attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
//       through: {
//         attributes: [], // This excludes all attributes from the join table
//       },
//     },
//   ];

//   const artistInfoAttrs = {
//     exclude: ['createdAt', 'updatedAt', 'deletedAt', 'services'],
//     include: [
//       [Sequelize.col('"artist"."phone"'), 'phone'],
//       [Sequelize.col('"artist"."reasonToDecline"'), 'reasonToDecline'],
//     ],
//   };

//   let artistInfo = await ArtistInfo.findOne({
//     where: [artistCondoition],
//     attributes: artistInfoAttrs,
//     include: includeModel,
//   });

//   if (artistInfo) {
//     return getPlainData(artistInfo);
//   } else {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Artist not found');
//   }
// };

const artIncludes = [
  {
    model: Service,
    as: 'service',
    attributes: ['name', 'isActive'],
  },
  {
    model: Category,
    as: 'category',
    attributes: ['name', 'isActive'],
  },
];

/**
 * Get all customeres
 * @param {Object} query
 * @returns {User}
 */

const getAllCustomersService = async (query) => {
  let { page, size, searchToken, status, startDate, endDate } = query;

  const includeModel = [
    {
      model: CustomerInfo,
      as: 'customerInfo',
      attributes: ['status', 'fullName', 'email', 'dob', 'gender', 'profilePic', 'createdAt'],
    },
  ];

  let customerCondition = { role: 'customer' };

  if (searchToken || status || (startDate && endDate)) {
    searchToken = searchToken && searchToken.trim();
    customerCondition = {
      ...customerCondition,
      ...GET_ALL_CUSTOMERS_SEARCH_QUERY(searchToken, status, startDate, endDate),
    };
  }

  const userAttributes = { exclude: ['role', 'fcmTokens', 'deletedAt'] };

  const allCustomers = await getPaginationDataFromModel(
    User,
    customerCondition,
    page,
    size,
    includeModel,
    userAttributes,
    'createdAt'
  );

  return allCustomers;
};

/**
 * Get single customer informations
 * @param {string} customerId
 * @returns {User}
 */
const getCustomerInfoService = async (customerId) => {
  const customerInfoAttrs = ['phone', 'fcmTokens', 'reasonToDecline'];

  const customerInfo = await User.findOne({
    where: { id: customerId },
    attributes: customerInfoAttrs,
    include: [
      {
        model: CustomerInfo,
        as: 'customerInfo',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      },
    ],
  });

  if (customerInfo) return getPlainData(customerInfo);
  else return {};
};

/**
 * Update artist status
 * @param {string} artistId
 * @param {object} body
 * @returns {Promise}
 */
const updateArtistStatusService = async (body, artistId) => {
  const transaction = getTransaction();

  const currentArtist = await User.findOne({ where: { id: artistId, role: 'artist' } });
  if (currentArtist) {
    const artistUpdateBody = { ...body, reasonToDecline: !!body.isActive ? null : body.reasonToDecline };
    const artistInfoUpdateBody = { status: body.status };
    await currentArtist.update(artistUpdateBody, { transaction });
    await ArtistInfo.update(artistInfoUpdateBody, { where: { artistId }, transaction });
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Artist not found');
  }
};

/**
 * Update art status
 * @param {object} body
 * @param {string} artistId
 * @param {string} artId
 * @returns {Promise}
 */
const updateArtStatusService = async (body, artistId, artId) => {
  const artist = await getArtistForAdmin(artistId);

  if (artist.dataValues.status === 'APPROVED') {
    const artCondition = { id: artId, artistId };
    const singleArt = await Art.findOne({ where: artCondition });
    if (singleArt) {
      const artUpdateBody = {
        ...body,
        reasonToDeclineArt: body.status === 'APPROVED' ? null : body.reasonToDeclineArt,
      };
      await singleArt.update(artUpdateBody);
    } else {
      throw new ApiError(httpStatus.NOT_FOUND, 'Art not found');
    }
  } else {
    throw new ApiError(httpStatus.FORBIDDEN, `Artist is currently ${artist.status}, please approve artist first`);
  }
};

/**
 * Switch art state
 * @param {object} body
 * @param {string} artistId
 * @param {string} artId
 * @returns {Promise}
 */
const switchArtStateService = async (body, artistId, artId) => {
  const artist = await getArtistForAdmin(artistId);

  if (artist.dataValues.status === 'APPROVED') {
    const artCondition = { id: artId, artistId };
    const singleArt = await Art.findOne({ where: artCondition });
    if (singleArt) {
      await singleArt.update(body);
    } else {
      throw new ApiError(httpStatus.NOT_FOUND, 'Art not found');
    }
  } else {
    throw new ApiError(httpStatus.FORBIDDEN, `Artist is currently ${artist.status}, please approve artist first`);
  }
};

/**
 * Update Latitude and Longitude of Artist's location
 * @param {object} body
 * @param {string} artistId
 * @returns {Promise}
 */
const updateLatLongService = async (body, artistId) => {
  await getArtistForAdmin(artistId);
  const artistInfoCondition = { artistId };
  await ArtistInfo.update(body, { where: artistInfoCondition });
};

/**
 * Verify UPI callback from cashfree
 * @param {string} upi
 * @returns
 */
//  ------------ OLD WITH GAMA URL ------------
// const verifyUpiCallback = async (upi) => {
//   const token = await getCFAuthToken();
//   const validateUpiResult = await verifyUPICallback(token, upi);
//   return validateUpiResult;
// };

//  ------------ NEW URL V2 ------------
const verifyUpiCallback = async (upi, name, verificationId) => {
  const validateUpiResult = await verifyUPICallbackV2(upi, name, verificationId);
  return validateUpiResult;
};

/**
 * Verify artist's UPI via cashfree APIs and methods
 * @param {string} artistId
 * @returns {object}
 */
const verifyUPIService = async (artistId) => {
  try {
    let artist = await ArtistInfo.findOne({
      where: { artistId },
      attributes: ['fullName'],
      include: [
        {
          model: ArtistBankingInfo,
          as: 'artistBankingInfo',
          attributes: ['upi'],
          where: { upi: { [Op.ne]: null } },
        },
      ],
    });

    if (artist) {
      artist = getPlainData(artist);
      const {
        fullName,
        artistBankingInfo: { upi },
      } = artist;

      const parseArtistId = artistId.split('-')[0];
      const curDate = Date.now();
      const verificationId = parseArtistId + '_' + curDate;

      const apiResult = await verifyUpiCallback(upi, fullName, verificationId);

      if (apiResult.status === 'VALID') {
        return apiResult;
      } else {
        logger.error('Invalid UPI: ' + JSON.stringify(apiResult));
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid UPI');
      }
    } else {
      throw new ApiError(httpStatus.NOT_FOUND, 'Artist not found');
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

/**
 * Verify artist's PAN via cashfree pan verification API
 * @param {string} artistId
 * @param {string} pan
 * @returns {object}
 */
const verifyPANService = async (artistId, pan) => {
  try {
    let artist = await ArtistInfo.findOne({
      where: { artistId },
      attributes: [],
      include: [
        {
          model: ArtistBankingInfo,
          as: 'artistBankingInfo',
          attributes: ['pan'],
          where: { pan },
        },
      ],
    });

    if (artist) {
      artist = getPlainData(artist);
      const {
        artistBankingInfo: { pan },
      } = artist;

      const panVerificationResult = await verifyPANCallback(pan);
      return panVerificationResult;
    } else {
      throw new ApiError(httpStatus.NOT_FOUND, 'The pan does not link with the artist');
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

const getAllArts = async (query, condition, include) => {
  let { page, size, searchToken, sortKey, status } = query;

  let artCondition = { ...condition };
  if (searchToken || status) {
    searchToken = searchToken && searchToken.trim();
    artCondition = {
      ...artCondition,
      ...GET_ALL_ARTS_SEARCH_QUERY(searchToken, status),
    };
  }

  const { orderByKey, orderBy } = getPriceOrdeConfig(sortKey);

  const allArts = await getPaginationDataFromModel(Art, artCondition, page, size, include, {}, orderByKey, orderBy);
  return allArts;
};

/**
 * Get all arts
 * @param {string} artistId
 * @param {number} page
 * @param {number} size
 * @param {string} searchToken
 * @param {string} sortKey
 * @returns {Promise<Art>}
 */
const getAllArtsForSingleArtistInAdminService = async (artistId, query) => {
  const include = [
    ...artIncludes,
    {
      model: ArtistInfo,
      as: 'artist',
      attributes: ['fullName'],
    },
  ];

  const allArtsForSingleArtist = await getAllArts(query, { artistId }, include);
  return allArtsForSingleArtist;
};

/**
 * Get all arts
 * @param {Object} query
 * @returns {User}
 */
const getAllArtsService = async (query) => {
  const include = [
    ...artIncludes,
    {
      model: ArtistInfo,
      as: 'artist',
      attributes: ['fullName', 'businessName', 'profilePic', 'email'],
    },
  ];

  const allArts = await getAllArts(query, {}, include);
  return allArts;
};

/**
 * Update artist status
 * @param {string} customerId
 * @param {object} body
 * @returns {Promise}
 */
const changeCustomerStatusService = async (body, customerId) => {
  const transaction = getTransaction();

  const currentCustomer = await User.findOne({ where: { id: customerId, role: 'customer' } });
  if (currentCustomer) {
    const customerUpdateBody = { ...body, reasonToDecline: !!body.isActive ? null : body.reasonToDecline };
    const customerInfoUpdateBody = { status: body.status };
    await currentCustomer.update(customerUpdateBody, { transaction });
    await CustomerInfo.update(customerInfoUpdateBody, { where: { customerId }, transaction });
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Customer not found');
  }
};

module.exports = {
  getAllArtistService,
  getArtistInfoService,
  getAllArtsForSingleArtistInAdminService,
  updateArtistStatusService,
  updateArtStatusService,
  switchArtStateService,
  updateLatLongService,
  verifyUPIService,
  verifyUpiCallback,
  verifyPANService,
  getAllCustomersService,
  getCustomerInfoService,
  getAllArtsService,
  changeCustomerStatusService,
};
