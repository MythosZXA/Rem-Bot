// environment variables
require('dotenv').config();
const fs = require('fs');
// connect to DB
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
	'sid39uidxq7spicc',														// db name
	'yo9w846giu5q1l1n',														// username
	process.env.sqlPassword, 											// password
	{
		host: 'pk1l4ihepirw9fob.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
		dialect: 'mysql',
		logging: false
	}
);

// create/import all the models & use to download db into map
const dir = './Models';
const modelFiles = fs.readdirSync(dir);
const remDB = new Map();
for (const file of modelFiles) {
	const modelName = file.split('.')[0];
	const model = require(`./Models/${file}`)(sequelize, Sequelize.DataTypes);
	remDB.set(modelName, model);
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
	remDB,
	Areas,
	CompletedQuests,
	Entities,
	Equip,
	Heroes,
	Inventories,
	Quests,
	Users,
};