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
// sql
// eslint-disable-next-line no-unused-vars
const { INET } = require('sequelize');
const { Users, Timers } = require('./sequelize');
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
// globals, set by event 'ready'
let remDB, channels;
// event listener
const eventFiles = fs.readdirSync('./Events').filter(file => file.endsWith('.js'));
for (const fileName of eventFiles) {
	const event = require(`./Events/${fileName}`);
	if (event.once) {
		rem.once(event.name, async (...args) => {
			await event.execute(...args, remDB, channels);
			remDB = rem.remDB;
			channels = rem.serverChannels;
		});
	} else {
		rem.on(event.name, (...args) => event.execute(...args, rem, remDB, channels));
	}
}

process.on('SIGTERM', () => {
	rem.destroy();
	console.log('Rem went down!');

	Users.bulkCreate(remDB.get('users'), { updateOnDuplicate: ['birthday', 'coins', 'rpsWins', 'streak', 'checkedIn'] });
	Timers.bulkCreate(remDB.get('timers'), { updateOnDuplicate: ['expiration_time', 'message', 'user_id'] });

	setTimeout(() => {
		process.exit();
	}, 1000 * 5);
});

process.on('uncaughtException', err => {
	rem.destroy();
	console.error('Rem went down!', err);

	Users.bulkCreate(remDB.get('users'), { updateOnDuplicate: ['birthday', 'coins', 'rpsWins', 'streak', 'checkedIn'] });
	Timers.bulkCreate(remDB.get('timers'), { updateOnDuplicate: ['expiration_time', 'message', 'user_id'] });

	setTimeout(() => {
		process.exit(1);
	}, 1000 * 5);
});