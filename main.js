// discord.js api								https://discord.js.org/#/
// discord.js guide							https://discordjs.guide/#before-you-begin

// enable environment variables
require('dotenv').config();
// discord client
const rem = require('./discord').setupRem();
// eslint-disable-next-line no-unused-vars
const { INET } = require('sequelize');
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
// event listeners
const eventFiles = fs.readdirSync('./Events').filter(file => file.endsWith('.js'));
for (const fileName of eventFiles) {
	const event = require(`./Events/${fileName}`);
	if (event.once) {		// discord ready event
		rem.once(event.name, async (...args) => {
			await event.execute(...args);
			remDB = rem.remDB;
			channels = rem.serverChannels;
		});
	} else if (event.many) {		// other discord events
		rem.on(event.name, (...args) => event.execute(...args, rem, remDB, channels));
	} else {		// node process events
		process.on(event.name, (...args) => event.execute(rem, remDB, ...args));
	}
}