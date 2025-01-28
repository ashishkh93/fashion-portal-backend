const httpStatus = require('http-status');
const { OtpRequest, ArtistInfo, ArtistBankingInfo } = require('../../models');
const ApiError = require('../../utils/ApiError');
const config = require('../../config/config');
const { createOtpRequest } = require('../common-services/otp.service');
const { handleVerificationByCF } = require('./verification.service');
const { getTransaction } = require('../../middlewares/asyncHooks');

const MAX_BANKING_OTP_ATTEMPTS = config.maxBankingOTPAttempts;
const upiVerificationTimeLimit = config.upiVerificationTimeLimit;

/**
 * Add artist banking info
 * @param {string} artistId
 * @param {Object} body
 */
const addArtistBankingInfoService = async (artistId, body) => {
  const artistBanking = await ArtistBankingInfo.findOne({ where: { artistId } });
  if (artistBanking) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Banking informations already added');
  } else {
    /**
     *  FIRST VERIFY THE UPI BY CASHFREE VERIFICATION API, THEN ADD IT TO DB
     */
    const verifiactionRes = await handleVerificationByCF(artistId, body.upi);
    if (verifiactionRes) {
      const bankingBody = { ...body, artistId, accountHolderName: verifiactionRes.name_at_bank, upiVerified: true };
      await ArtistBankingInfo.create(bankingBody);
      return body;
    }
  }
};

const artistVerificationDuringUpiUpdation = async (artist, artistInfo, phone) => {
  if (artist.phone !== phone) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No mobile registered in the system');
  }

  const artistBanking = await artistInfo.getArtistBankingInfo();
  const artistCanUpdateBankingInfo = artistBanking?.canUpdateBankingInfo;

  if (!artistBanking) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Banking info not found.');
  } else if (!artistCanUpdateBankingInfo) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Your account is temporarily restricted from updating banking information due to multiple incorrect OTP entries. Please contact the support team to regain access.'
    );
  }
};

/**
 * Edit artist upi id
 * @param {string} artistId
 * @param {object} body
 * @returns {Promise<ArtistInfo>}
 */
const editArtistUPIService = async (artistId, body, artistInfo, artist) => {
  await artistVerificationDuringUpiUpdation(artist, artistInfo, body.phone);

  const transaction = getTransaction();
  const otpRequest = await OtpRequest.findOne({
    where: {
      userId: artistId,
      isVerified: true,
      context: 'BANKING',
    },
    order: [['createdAt', 'DESC']],
  });

  if (!otpRequest) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Please complete the verifing OTP flow before updating UPI.');
  }

  const verificationTimeLimit = upiVerificationTimeLimit * 60 * 1000; // 10 minutes in milliseconds
  if (new Date() - new Date(otpRequest.updatedAt) > verificationTimeLimit) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP verification expired. Please verify OTP again to update UPI.');
  }

  const artistBanking = await ArtistBankingInfo.findOne({ where: { artistId } });
  if (artistBanking) {
    const verifiactionRes = await handleVerificationByCF(artistId, body.upi);
    if (verifiactionRes) {
      const updateUpiBody = { upi: body.upi, upiVerified: true };
      await artistBanking.update(updateUpiBody, { transaction });
      await otpRequest.destroy({ transaction });
    } else {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Something went wrong, please try after sometime, if issue persist contact to our support team.'
      );
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Banking info not found.');
  }
};

/**
 * Request OTP for UPI update
 * @param {string} artistId
 * @param {object} body
 * @param {object} artistInfo
 * @param {object} artist
 * @returns {Promise<ArtistInfo>}
 */
const requestOtpForUpiChangeService = async (artistId, body, artistInfo, artist) => {
  await artistVerificationDuringUpiUpdation(artist, artistInfo, body.phone);
  await createOtpRequest(artistId, 'BANKING');
};

/**
 * Request OTP for UPI update
 * @param {string} artistId
 * @param {object} body
 * @param {object} artistInfo
 * @param {object} artist
 * @returns {Promise<ArtistInfo>}
 */
const verifyOTPToUpdateUpiService = async (artistId, body, artistInfo, artist) => {
  await artistVerificationDuringUpiUpdation(artist, artistInfo, body.phone);

  const otpRequest = await OtpRequest.findOne({
    where: {
      userId: artistId,
      isVerified: false,
      context: 'BANKING',
    },
    order: [['createdAt', 'DESC']],
  });

  if (!otpRequest || otpRequest.otpExpiration <= Date.now()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP');
  }

  if (otpRequest.numberOfAttempts >= MAX_BANKING_OTP_ATTEMPTS) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Maximum OTP attempts reached. Contact admin to udpate UPI.');
  }

  if (otpRequest.otp !== body.otp) {
    // Increment the number of attempts if the OTP is incorrect
    const newAttempts = otpRequest.numberOfAttempts + 1;
    await otpRequest.update({ numberOfAttempts: newAttempts });

    if (newAttempts >= MAX_BANKING_OTP_ATTEMPTS) {
      // Disable the artist's ability to update UPI
      await ArtistBankingInfo.update({ canUpdateBankingInfo: false }, { where: { artistId } });
      throw new ApiError(httpStatus.FORBIDDEN, 'Maximum OTP attempts reached. Contact admin to udpate UPI.');
    }

    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }

  const otpUpdateEntry = {
    isVerified: true,
    numberOfAttempts: 0, // Reset attempts after successful verification
  };
  await otpRequest.update(otpUpdateEntry);
};

module.exports = {
  addArtistBankingInfoService,
  editArtistUPIService,
  requestOtpForUpiChangeService,
  verifyOTPToUpdateUpiService,
};
