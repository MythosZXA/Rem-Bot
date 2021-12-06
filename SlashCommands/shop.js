const { SlashCommandBuilder } = require('@discordjs/builders');
const { Formatters } = require('discord.js');

async function execute(interaction, sequelize, DataTypes) {
  const currencyShop = require('../Models/currencyShop')(sequelize, DataTypes);
  const items = await currencyShop.findAll();
  return interaction.reply(Formatters.codeBlock(items.map(item => `${item.name}: ${item.cost}`).join('\n')));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Display the shop'),
  execute,
}