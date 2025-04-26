'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FirebaseUser', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'User', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      firebase_uid: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      fcmToken: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      deviceInfo: {
        type: Sequelize.JSONB, // or separate fields if preferred
        allowNull: true,
        comment: 'Includes device model, OS version, app version, etc.',
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      preferences: {
        type: Sequelize.JSONB,
        defaultValue: {
          promotional: true,
          appointmentUpdates: true,
          reviews: true,
        },
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

  async down(queryInterface) {
    await queryInterface.dropTable('FirebaseUser');
  },
};
