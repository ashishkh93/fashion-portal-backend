'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('ArtistInfo', 'recentWorkImages', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: [],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('ArtistInfo', 'recentWorkImages', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true, // Revert to the original state
    });
  },
};
