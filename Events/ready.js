module.exports = {
	name: 'ready',
	once: true,
	async execute(rem) {
		// set up global variables
		const server = await rem.guilds.fetch('773660297696772096');
		const remDB = await require('../sequelize').importDBToMemory();
		const channels = await require('../channels').getServerChannels(server);

		// caches users for easier access
		server.members.fetch();
		
		// check for special days when tomorrow comes
		// specialDaysFunctions.checkHoliday(channels);
		// specialDaysFunctions.checkBirthday(server, remDB, channels);

		// update on new day
		// twitterFunctions.checkForNewTweets(remDB, channels);

		// setups
		// rem.commands.get('timer').setupTimers(rem, remDB);

		// server
		// check for special days when tomorrow comes
		// specialDaysFunctions.checkHoliday(channels);
		// specialDaysFunctions.checkBirthday(server, remDB, channels);

		// setups
		// rem.commands.get('timer').setupTimers(rem, remDB);

		// server
		require('../express').setupServer(rem, remDB);

		// attach globals to client so main.js can access
		rem.remDB = remDB;
		rem.serverChannels = channels;
		console.log('Rem is online.');
	}
};