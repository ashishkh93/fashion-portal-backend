const httpStatus = require('http-status');
const moment = require('moment');
const ApiError = require('../../utils/ApiError');
const { User, ArtistBankingInfo, ArtistInfo } = require('../../models');
const { payoutAPICallback } = require('../../utils/cashfree-payout-api.util');
const { Op } = require('sequelize');
const { getPlainData } = require('../../utils/common.util');

const getApprovedAndUPIExistingArtist = async (artistId) => {
  const artist = await User.findOne({
    where: { id: artistId, role: 'artist', isActive: true },
    include: [
      {
        model: ArtistInfo,
        as: 'artistInfos',
        where: { status: 'APPROVED' },
        include: [
          {
            model: ArtistBankingInfo,
            as: 'artistBankingInfo',
            attributes: ['beneficiaryId', 'upi', 'pan'],
            where: { upi: { [Op.ne]: null } },
          },
        ],
      },
    ],
  });

  if (artist) {
    return artist;
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'Artist is not approved yet');
  }
};

/**
 * Add beneficiary in cashfree payout dashboard
 * @param {object} body
 * @param {string} artistId
 * @returns {Promise}
 */
const addBeneToCFService = async (artistId) => {
  const artistFromModel = await getApprovedAndUPIExistingArtist(artistId);
  const artist = getPlainData(artistFromModel);

  const artistInfos = artist.artistInfos;
  const artistBankingInfo = artist.artistInfos.artistBankingInfo;

  // TEST UPI -> success@upi

  try {
    const artistCreationDate = moment(artist.createdAt).format('DDMMYYYY');
    // const currentDate = moment().format('DDMMYYYY');
    const parsedArtistId = artistId.split('-')[0];
    const beneId = parsedArtistId + '_' + artistCreationDate;
    const addBeneficiaryBody = {
      beneficiary_id: beneId,
      beneficiary_name: artistInfos.fullName,
      beneficiary_instrument_details: { vpa: artistBankingInfo.upi },
      beneficiary_contact_details: {
        beneficiary_email: artistInfos.email,
        beneficiary_phone: artist.phone,
        beneficiary_country_code: '+91',
        beneficiary_address: artistInfos.location,
        beneficiary_city: artistInfos.city,
        beneficiary_state: artistInfos.state,
        beneficiary_postal_code: artistInfos.pincode,
      },
    };

    const addBeneResponse = await payoutAPICallback('POST', addBeneficiaryBody, '/beneficiary');
    const data = await addBeneResponse.json();

    if (addBeneResponse.status === 201) {
      /**
       * Update beneficiary id to the artist info table, if there is no error in cashfree api
       */
      const artistInfoUpdateBody = { beneficiaryId: beneId };
      // await ArtistInfo.update(artistInfoUpdateBody, { where: { artistId } });
      await ArtistBankingInfo.update(artistInfoUpdateBody, { where: { artistId } });
      return data;
    } else {
      throw new ApiError(addBeneResponse.status || httpStatus.INTERNAL_SERVER_ERROR, data.message || 'Something went wrong');
    }
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }
};

module.exports = {
  addBeneToCFService,
};
