'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('User', 'fcmTokens');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('User', 'fcmTokens', {
      type: Sequelize.ARRAY(Sequelize.STRING(256)),
      defaultValue: [],
    });
  },
};
