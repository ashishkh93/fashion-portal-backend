const httpStatus = require('http-status');
const { User, ArtistInfo, Service } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPaginationDataFromModel } = require('../../utils/paginate');

/**
 * Get all services
 * @param {number} page
 * @param {number} size
 * @returns {User}
 */

const getAllArtistService = async (page, size) => {
  try {
    const artistCondoition = { role: 'artist', isActive: true };
    const includeModel = [
      {
        model: ArtistInfo,
        as: 'artistInfos',
        attributes: { exclude: ['bankAccountNumber', 'deletedAt', 'services'] },
        include: [
          {
            model: Service,
            as: 'artistServices', // Ensure this matches the alias we used in association
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
            through: {
              attributes: [], // This excludes all attributes from the join table
            },
          },
        ],
      },
    ];

    const userAttributes = { exclude: ['otp', 'otpExpire', 'deletedAt'] };

    const allService = await getPaginationDataFromModel(User, artistCondoition, page, size, includeModel, userAttributes);

    return allService;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Error while fetching the artists');
  }
};

module.exports = {
  getAllArtistService,
};
