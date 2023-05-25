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

const Timers = require('./Models/timers')(sequelize, Sequelize.DataTypes);
const Users = require('./Models/users')(sequelize, Sequelize.DataTypes);

module.exports = {
	sequelize,
	importDBToMemory,
	Timers,
	Users,
};