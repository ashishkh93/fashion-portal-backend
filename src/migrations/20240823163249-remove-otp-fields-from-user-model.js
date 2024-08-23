'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('User', 'otp');
    await queryInterface.removeColumn('User', 'otpExpire');
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.addColumn('User', 'otp', {
     type: Sequelize.INTEGER,
     allowNull: true,
   });
   await queryInterface.addColumn('User', 'otpExpire', {
     type: Sequelize.BIGINT,
     allowNull: true,
   });
  }
};
