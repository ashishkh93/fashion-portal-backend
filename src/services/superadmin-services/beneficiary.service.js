const httpStatus = require('http-status');
const moment = require('moment');
const ApiError = require('../../utils/ApiError');
const { ArtistBankingInfo } = require('../../models');
const { getApprovedArtist } = require('../artist-services/artist.service');
const { payoutAPICallback } = require('../../utils/cashfree-payout-api.util');

/**
 * Add beneficiary in cashfree payout dashboard
 * @param {object} body
 * @param {string} artistId
 * @returns {Promise}
 */
const addBeneToCFService = async (body, artistId) => {
  const artistFromModel = await getApprovedArtist(artistId);
  const artist = artistFromModel.get({ plain: true });
  const artistInfos = artist.artistInfos;
  const artistBankingInfo = artist.artistInfos.artistBankingInfo;

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
