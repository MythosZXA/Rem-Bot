const leaderboardFunctions = require('../Functions/leaderboardFunctions');
const specialDaysFunctions = require('../Functions/specialDaysFunctions');
const twitterFunctions = require('../Functions/twitterFunctions');
const voiceFunctions = require('../Functions/voiceFunctions');

module.exports = {
	name: 'ready',
	once: true,
	async execute(rem, remDB, channels) {
		// set up global variables
		const server = await rem.guilds.fetch('773660297696772096');
		remDB = await require('../sequelize').importDBToMemory();
		channels = await require('../channels').getServerChannels(server);

		// caches users for easier access
		server.members.fetch();
		// update leaderboards on startup
		// leaderboardFunctions.updateHeroLeaderboard(rem, sequelize, Sequelize.DataTypes);
		leaderboardFunctions.updateGamblingLeaderboard(rem, remDB, channels);

		// check for special days when tomorrow comes
		specialDaysFunctions.checkHoliday(channels);
		specialDaysFunctions.checkBirthday(server, remDB, channels);

		// update on new day
		leaderboardFunctions.checkStreakCondition(rem, remDB, channels);
		twitterFunctions.checkForNewTweets(remDB, channels);
		voiceFunctions.update(rem);

		// setups
		rem.commands.get('roulette').start(rem, remDB, channels);
		rem.commands.get('timer').setupTimers(rem, remDB);

		// attach globals to client so main.js can access
		rem.remDB = remDB;
		rem.serverChannels = channels;
		console.log('Rem is online.');
	}
};