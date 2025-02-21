'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('User', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('superAdmin', 'artist', 'customer'),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      fcmTokens: {
        type: Sequelize.ARRAY(Sequelize.STRING(256)),
        defaultValue: [],
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      tokenVersion: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      reasonToDecline: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('User');
  },
};
