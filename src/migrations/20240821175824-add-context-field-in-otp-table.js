'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('OtpRequest', 'context', {
      type: Sequelize.ENUM('LOGIN', 'BANKING'),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('OtpRequest', 'context');
  },
};
