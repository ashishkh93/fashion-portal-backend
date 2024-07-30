'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('Payout', 'artistIds');
    await queryInterface.removeColumn('Payout', 'orderDetail');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Payout', 'artistIds', {
      type: Sequelize.ARRAY(Sequelize.UUID),
      allowNull: false,
    });
    await queryInterface.addColumn('Payout', 'orderDetail', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },
};
