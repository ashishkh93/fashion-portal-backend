const { Op } = require("sequelize");

const dateRangeQuery = (startDate, endDate) => ({
  createdAt: {
    [Op.between]: [new Date(startDate), new Date(new Date(endDate).setHours(23, 59, 59, 999))],
  },
});

module.exports = { dateRangeQuery };
