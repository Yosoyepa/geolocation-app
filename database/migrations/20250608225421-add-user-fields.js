'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'isActive', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });
    
    await queryInterface.addColumn('Users', 'lastLoginAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addIndex('Users', ['email'], {
      unique: true,
      name: 'users_email_unique'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('Users', 'users_email_unique');
    await queryInterface.removeColumn('Users', 'lastLoginAt');
    await queryInterface.removeColumn('Users', 'isActive');
  }
};
