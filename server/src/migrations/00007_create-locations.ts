import Sequelize, {DataTypes, QueryInterface} from 'sequelize';
import {Application} from '../declarations';

export default {
  async up(query: QueryInterface, app: Application): Promise<void> {
    const tableName = [app.get('db_prefix'), 'locations'].join('_');
    await query.createTable(tableName, {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      rawText: {
        type: DataTypes.STRING,
        allowNull: false
      },
      latitude: {
        type: DataTypes.DOUBLE,
        allowNull: true
      },
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
      },
      street: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
      },
      number: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
      },
      detail: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
      },
      locality: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
      },
      hubLocationId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      incidentId: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
    await query.addConstraint(tableName, {
      type: 'foreign key',
      fields: ['incidentId'],
      references: { table: [app.get('db_prefix'), 'incidents'].join('_'), field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },
  async down(query: QueryInterface, app: Application): Promise<void> {
    await query.dropTable([app.get('db_prefix'), 'locations'].join('_'));
  }
};
