'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ArtistTransferOrder', {
      transferId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Transfer', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Order', key: 'id' },
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
    await queryInterface.dropTable('ArtistTransferOrder');
  },
};
