'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Criar o ENUM antes da tabela
    await queryInterface.sequelize.query(`
      CREATE TYPE enum_bank_id AS ENUM ('api-mini-bc', 'banco-central', 'bank-account-api', 'mini-banco-central');
    `);

    await queryInterface.createTable('user_bank_tokens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      user_cpf: {
        type: Sequelize.STRING,
        allowNull: false,
        references: { model: 'users', key: 'cpf' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      bank_id: {
        type: 'enum_bank_id',
        allowNull: false,
      },
      bank_token: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_bank_tokens');
    await queryInterface.sequelize.query(`DROP TYPE enum_bank_id;`);
  },
};
