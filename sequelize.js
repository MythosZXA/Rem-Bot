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
const User = require('./Classes/User');
async function importDBToMemory() {
	const dir = './Models';
	const modelFiles = fs.readdirSync(dir);
	const remDB = new Map();
	for (const file of modelFiles) {
		const modelName = file.split('.')[0];
		const model = require(`./Models/${file}`)(sequelize, Sequelize.DataTypes);
		const tuplesArray = await model.findAll({ raw: true });

		switch (modelName) {
			case "users":
				let classUser = new Map();
				tuplesArray.forEach(tuple => {
					classUser.set(tuple.id, new User(tuple.id, tuple.username, tuple.birthday));
				});
				remDB.set(modelName, classUser);
				break;
			default:
				remDB.set(modelName, tuplesArray);
		}
	}

	return remDB;
}

const Timers = require('./Models/timers')(sequelize, Sequelize.DataTypes);
const Users = require('./Models/users')(sequelize, Sequelize.DataTypes);
async function exportMemoryToDB(rem) {
	// convert User class into array of obj to store in DB
	let users = [];
	rem.remDB.get('users').forEach(user => {
		users.push(user.toObj())
	});

	try {
		await Users.bulkCreate(users, { updateOnDuplicate: ['birthday'] });
		await Timers.bulkCreate(rem.remDB.get('timers'), { updateOnDuplicate: ['expiration_time', 'message', 'user_id'] });
		console.log('DB Saved');
	} catch (error) {
		console.log(error);
	}
}

function dropUser(userID) {
	try { Users.destroy({ where: { id: userID } }); }
	catch(error) { console.log(error); }
}

module.exports = {
	importDBToMemory,
	exportMemoryToDB,
	dropUser,
};