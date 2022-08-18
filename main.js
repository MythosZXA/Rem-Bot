// discord.js api								https://discord.js.org/#/
// discord.js guide							https://discordjs.guide/#before-you-begin

// enable environment variables
require('dotenv').config();
// discord
const { Client } = require('discord.js');
const rem = new Client({
	intents: [
		'GUILDS',
		'GUILD_MEMBERS',
		'GUILD_EMOJIS_AND_STICKERS',
		'GUILD_VOICE_STATES',
		'GUILD_PRESENCES',
		'GUILD_MESSAGES',
		'DIRECT_MESSAGES',
	],
	partials: ['CHANNEL']
});
let remDB, channels;
const leaderboardFunctions = require('./Functions/leaderboardFunctions');
const specialDaysFunctions = require('./Functions/specialDaysFunctions');
const twitterFunctions = require('./Functions/twitterFunctions');
const voiceFunctions = require('./Functions/voiceFunctions');
// sql
// eslint-disable-next-line no-unused-vars
const { INET } = require('sequelize');
const { Users } = require('./sequelize');
// set commands
const fs = require('fs');
const { default: Collection } = require('@discordjs/collection');
rem.commands = new Collection();
const commandFiles = fs.readdirSync('./SlashCommands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./SlashCommands/${file}`);
	rem.commands.set(command.data.name, command);
}

// start up
rem.login(process.env.token);
rem.once('ready', async () => {
	// set up global variables
	const server = await rem.guilds.fetch('773660297696772096');
	remDB = await require('./sequelize').importDBToMemory();
	channels = await require('./channels').getServerChannels(server);
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
	twitterFunctions.checkNewTweets(channels);
	voiceFunctions.update(rem);
	rem.commands.get('roulette').start(rem, remDB, channels);

	console.log('Rem is online.');
});

// event listener
const eventFiles = fs.readdirSync('./Events').filter(file => file.endsWith('.js'));
for (const fileName of eventFiles) {
	const event = require(`./Events/${fileName}`);
	if (event.once) {
		rem.once(event.name, (...args) => event.execute(...args, rem, remDB, channels));
	} else {
		rem.on(event.name, (...args) => event.execute(...args, rem, remDB, channels));
	}
}

process.on('SIGTERM', () => {
	rem.destroy();
	console.log('Rem went down!');

	Users.bulkCreate(remDB.get('users'), { updateOnDuplicate: ['birthday', 'coins', 'rpsWins', 'streak', 'checkedIn'] });

	setTimeout(() => {
		process.exit();
	}, 1000 * 5);
});

process.on('uncaughtException', err => {
	rem.destroy();
	console.error('Rem went down!', err);

	Users.bulkCreate(remDB.get('users'), { updateOnDuplicate: ['birthday', 'coins', 'rpsWins', 'streak', 'checkedIn'] });

	setTimeout(() => {
		process.exit(1);
	}, 1000 * 5);
});