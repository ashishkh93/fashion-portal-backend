'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    queryInterface.addColumn('Users', 'fcmToken', {
      type: Sequelize.STRING(256),
      allowNull: true,
      unique: true,
    });
  },
};
