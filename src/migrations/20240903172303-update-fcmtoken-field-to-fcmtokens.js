'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('User', 'fcmToken');
    await queryInterface.addColumn('User', 'fcmTokens', {
      type: Sequelize.ARRAY(Sequelize.STRING(256)),
      defaultValue: [],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('User', 'fcmToken', {
      type: Sequelize.STRING(256),
      allowNull: true,
      unique: true,
    });
    await queryInterface.removeColumn('User', 'fcmTokens');
  },
};
