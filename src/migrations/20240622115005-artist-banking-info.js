'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Model for artist-banking-info
     */
    await queryInterface.createTable('ArtistBankingInfos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      artistId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'Users', key: 'id' },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      beneficiaryId: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      bankName: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      upi: {
        type: Sequelize.STRING(120), // because we are storing the cipher
        allowNull: true,
        unique: true,
      },
      pan: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      panImage: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {},
};
