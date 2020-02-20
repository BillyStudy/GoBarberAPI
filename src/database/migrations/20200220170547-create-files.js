'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('files', {
        id: {
          type: Sequelize.INTEGER,
          allownull: false,
          autoIncrement: true,
          primaryKey: true
        },
        name:{
          type: Sequelize.STRING,
          allownull: false,
        },
        path:{
          type: Sequelize.STRING,
          allownull: false,
          unique: true
        },

        created_at:{
          type: Sequelize.DATE,
          allownull: false
        },
        updated_at:{
          type: Sequelize.DATE,
          allownull: false
        }
      });

  },

  down: (queryInterface) => {
      return queryInterface.dropTable('files');
  }
};
