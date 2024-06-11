'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('Reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      artistId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'ArtistInfos',
          key: 'artistId',
        },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Orders',
          key: 'id',
        },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      givenBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'CustomerInfos',
          key: 'customerId',
        },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      reviewCount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      description: {
        type: Sequelize.STRING(1024),
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
};
