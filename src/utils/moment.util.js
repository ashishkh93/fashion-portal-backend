const moment = require('moment');

const convertDateBasedOnTZ = (date) => {
  return moment(date).tz('Asia/Kolkata').format();
};

module.exports = { convertDateBasedOnTZ };
