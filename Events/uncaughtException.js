const { Users, Timers } = require('../sequelize');

module.exports = {
	name: 'uncaughtException',
	process: true,
	async execute(rem, remDB, err) {
		try {
			await Users.bulkCreate(remDB.get('users'), { updateOnDuplicate: ['birthday', 'coins', 'rpsWins', 'streak', 'checkedIn'] });
			await Timers.bulkCreate(remDB.get('timers'), { updateOnDuplicate: ['expiration_time', 'message', 'user_id'] });
			
			console.log('DB Saved');
			
			console.error('Rem went down!', err);
			rem.destroy();
			process.exit();
		} catch(error) {
			console.log(error);
		}
	}
};