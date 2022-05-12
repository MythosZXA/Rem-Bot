// environment variables
require('dotenv').config();

const Sequelize = require('sequelize');
let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {dialect: 'mysql', logging: false});
}

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