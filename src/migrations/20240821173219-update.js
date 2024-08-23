'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('OtpRequest', 'otp', {
      type: Sequelize.STRING(8),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('OtpRequest', 'otp', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
