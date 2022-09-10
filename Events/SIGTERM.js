const { Users, Timers, Tweets } = require('../sequelize');

module.exports = {
	name: 'SIGTERM',
	process: true,
	async execute(rem, remDB) {
		try {
			await Users.bulkCreate(remDB.get('users'), { updateOnDuplicate: ['birthday', 'coins', 'rpsWins', 'streak', 'checkedIn'] });
			await Timers.bulkCreate(remDB.get('timers'), { updateOnDuplicate: ['expiration_time', 'message', 'user_id'] });
			await Tweets.bulkCreate(remDB.get('tweets'), { updateOnDuplicate: ['tweet_id', 'created_at', 'twitter_handle'] });
			console.log('DB Saved');
			
			console.log('Rem went down!');
			rem.destroy();
			process.exit();
		} catch(error) {
			console.log(error);
		}
	}
};