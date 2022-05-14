// environment variables
require('dotenv').config();

const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  'sid39uidxq7spicc',
  'yo9w846giu5q1l1n',
  process.env.sqlPassword, 
  {
    host: 'pk1l4ihepirw9fob.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    port: '3306',
    username: 'yo9w846giu5q1l1n',
    password: process.env.sqlPassword,
    database: 'sid39uidxq7spicc',
    dialect: 'mysql',
    // logging: false
  }
);

const Areas = require('./Models/areas')(sequelize, Sequelize.DataTypes);
const CompletedQuests = require('./Models/completed_quests')(sequelize, Sequelize.DataTypes);
const Entities = require('./Models/entities')(sequelize, Sequelize.DataTypes);
const Equip = require('./Models/equip')(sequelize, Sequelize.DataTypes);
const Heroes = require('./Models/heroes')(sequelize, Sequelize.DataTypes);
const Inventories = require('./Models/inventories')(sequelize, Sequelize.DataTypes);
const Quests = require('./Models/quests')(sequelize, Sequelize.DataTypes);
const Users = require('./Models/users')(sequelize, Sequelize.DataTypes);

module.exports = {
  sequelize,
  Areas,
  CompletedQuests,
  Entities,
  Equip,
  Heroes,
  Inventories,
  Quests,
  Users,
};