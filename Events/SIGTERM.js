const { Users, Timers} = require('../sequelize.js');

module.exports = {
	name: 'SIGTERM',
	process: true,
	async execute(rem, remDB) {
		try {
			await Users.bulkCreate(remDB.get('users'), { updateOnDuplicate: ['birthday', 'coins', 'rpsWins', 'streak', 'checkedIn'] });
			await Timers.bulkCreate(remDB.get('timers'), { updateOnDuplicate: ['expiration_time', 'message', 'user_id'] });
			console.log('DB Saved');
			
			console.log('Rem went down!');
			rem.destroy();
			process.exit();
		} catch(error) {
			console.log(error);
		}
	}
};