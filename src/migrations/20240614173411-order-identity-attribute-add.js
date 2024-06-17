'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add attirbute to the model
     *
     */
    // await queryInterface.addColumn('Orders', 'orderIdentity', {
    //   type: Sequelize.STRING(50),
    //   allowNull: false,
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'orderIdentity');
  },
};
