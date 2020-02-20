'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('appointments', {
        id: {
          type: Sequelize.INTEGER,
          allownull: false,
          autoIncrement: true,
          primaryKey: true
        },
        date:{
          type: Sequelize.DATE,
          allownull: false,
        },
        user_id:{
          type: Sequelize.INTEGER,
          references: { model: 'users', key: 'id'},
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          allowNull: true
        },
        provider_id:{
          type: Sequelize.INTEGER,
          references: { model: 'users', key: 'id'},
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          allowNull: true
        },
        canceled_at:{
          type: Sequelize.DATE,
          allowNull: true
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
      return queryInterface.dropTable('appointments');
  }
};
