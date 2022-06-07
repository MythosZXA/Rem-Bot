// environment variables
require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const rest = new REST({ version: '9' }).setToken(process.env.token);

(async () => {
	try {
		await rest.delete(
			`${Routes.applicationGuildCommands(process.env.clientId, process.env.guildId)}/`
		);

		console.log('Successfully deleted command');
	} catch (error) {
		console.error(error);
	}
})();