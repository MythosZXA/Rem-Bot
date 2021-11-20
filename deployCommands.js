// environment variables
require('dotenv').config();
const fs = require('fs');
const { REST } = require('@discordjs/rest');

const commands = [];
const commandFiles = fs.readdirSync('./SlashCommands').filter(file => file.endsWith('.js'));

const rest = new REST({ version: '9' }).setToken(process.env.token);

for (const file of commandFiles) {
    const command = require(`./SlashCommands/${file}`);
    commands.push(command.data.toJSON());
    console.log('Commands saved!');
}