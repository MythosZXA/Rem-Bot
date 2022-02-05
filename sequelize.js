// environment variables
require('dotenv').config();

const Sequelize = require('sequelize');
const sequelize = new Sequelize('rem', 'root', process.env.sqlPassword, {
	host: 'localhost',
	dialect: 'mysql',
	logging: false,
});
const Areas = require('./Models/areas')(sequelize, Sequelize.DataTypes);
const CompletedQuests = require('./Models/completed_quests')(sequelize, Sequelize.DataTypes);
const Entities = require('./Models/entities')(sequelize, Sequelize.DataTypes);
const Equip = require('./Models/equip')(sequelize, Sequelize.DataTypes);
const Heroes = require('./Models/heroes')(sequelize, Sequelize.DataTypes);
const Quests = require('./Models/quests')(sequelize, Sequelize.DataTypes);
const Users = require('./Models/users')(sequelize, Sequelize.DataTypes);

module.exports = {
  sequelize,
  Areas,
  CompletedQuests,
  Entities,
  Equip,
  Heroes,
  Quests,
  Users,
};