// sequelize				https://sequelize.org/

// enable environment variables
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
async function importDBToMemory() {
	const dir = './Models';
	const modelFiles = fs.readdirSync(dir);
	const remDB = new Map();
	for (const file of modelFiles) {
		const modelName = file.split('.')[0];
		const model = require(`./Models/${file}`)(sequelize, Sequelize.DataTypes);
		const tuplesArray = await model.findAll({ raw: true });
		remDB.set(modelName, tuplesArray);
	}

	return remDB;
}

const Areas = require('./Models/areas')(sequelize, Sequelize.DataTypes);
const CompletedQuests = require('./Models/completed_quests')(sequelize, Sequelize.DataTypes);
const Entities = require('./Models/entities')(sequelize, Sequelize.DataTypes);
const Equip = require('./Models/equip')(sequelize, Sequelize.DataTypes);
const Heroes = require('./Models/heroes')(sequelize, Sequelize.DataTypes);
const Inventories = require('./Models/inventories')(sequelize, Sequelize.DataTypes);
const Quests = require('./Models/quests')(sequelize, Sequelize.DataTypes);
const Timers = require('./Models/timers')(sequelize, Sequelize.DataTypes);
const Tweets = require('./Models/tweets')(sequelize, Sequelize.DataTypes);
const Users = require('./Models/users')(sequelize, Sequelize.DataTypes);

module.exports = {
	sequelize,
	importDBToMemory,
	Areas,
	CompletedQuests,
	Entities,
	Equip,
	Heroes,
	Inventories,
	Quests,
	Timers,
	Tweets,
	Users,
};