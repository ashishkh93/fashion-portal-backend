'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Transfer', 'orderIds', {
      type: Sequelize.ARRAY(Sequelize.UUID),
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Transfer', 'orderIds');
  },
};
