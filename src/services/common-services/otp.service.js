const { OtpRequest } = require('../../models');
const { generateOtp } = require('../../utils/common.util');

const createOtpRequest = async (userId, context, transaction) => {
  const { otp, otpExpire } = await generateOtp();

  const otpEntry = {
    userId,
    otp,
    otpExpiration: otpExpire,
    context,
  };

  if (transaction) {
    await OtpRequest.create(otpEntry, { transaction });
  } else {
    await OtpRequest.create(otpEntry);
  }

  /**
   * Send thr OTP to artist to verify the next step
   */
};

module.exports = { createOtpRequest };
