const { SlashCommandBuilder } = require("@discordjs/builders");
const { Formatters } = require('discord.js');

async function execute(interaction, sequelize, DataTypes) {
  const UserItems = require('../Models/userItems')(sequelize, DataTypes);
  const items = await UserItems.findAll();
  const displayHeader = 'ID'.padEnd(5) + 'Name'.padEnd(25) + 'Amount';
  const displayArray = items.map(item => 
    `${item.id}`.padEnd(5) +
    `${item.name}`.padEnd(25) +
    `${item.amount}`)
    .join('\n');
  return interaction.reply(Formatters.codeBlock(`${displayHeader}\n${displayArray}`));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Displays your hero\'s inventory'),
  execute,
}