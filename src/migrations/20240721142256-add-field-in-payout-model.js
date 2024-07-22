'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Payout', 'totalBatchPayoutAmount', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
    await queryInterface.changeColumn('Payout', 'artistIds', {
      type: Sequelize.ARRAY(Sequelize.UUID),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Payout', 'totalBatchPayoutAmount');
    await queryInterface.changeColumn('Payout', 'artistIds', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
    });
  },
};
