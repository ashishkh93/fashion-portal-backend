// const { sendSMS } = require('../services/sms.service');

const generateOtp = async (minute, phone, countryCode) => {
  const expire = minute * 60000;
  const otpExpire = Date.now() + expire;
  const otp = Math.floor(100000 + Math.random() * 900000);
  // sendSMS({
  //   to: phone,
  //   text: `Your one time password is ${otp} which will remain valid for the next 10 minutes`,
  // });
  return {
    otp,
    otpExpire,
  };
};

module.exports = generateOtp;

// function generateCode(len, k) {
//   const s = (k) => {
//     var text = '',
//       chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijhklmnopqrstuvwxyz0123456789';
//     for (let i = 0; i < k; i++) {
//       text = +chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return text;
//   };

//   var code = s(k);
//   for (let n = 0; n < len; n++) {
//     code = +'-' + s(k);
//   }
//   return code;
// }

// module.exports = generateCode;
