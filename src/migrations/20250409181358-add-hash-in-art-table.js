'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Art', 'hash', {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Art', 'hash');
  },
};
