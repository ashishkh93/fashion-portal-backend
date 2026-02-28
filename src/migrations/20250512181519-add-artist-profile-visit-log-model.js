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
    await queryInterface.createTable('ArtistProfileVisitLog', {
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
          model: 'ArtistInfo',
          key: 'artistId',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'CustomerInfo',
          key: 'customerId',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      visitedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      source: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
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
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('ArtistProfileVisitLog');
  },
};
