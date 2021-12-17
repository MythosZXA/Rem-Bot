const { SlashCommandBuilder } = require("@discordjs/builders");
const { Formatters, MessageButton, MessageActionRow } = require('discord.js');

const closeButton = new MessageButton()
  .setCustomId('close')
  .setLabel('Close')
  .setStyle('DANGER');

async function execute(interaction, sequelize, DataTypes) {
  const Inventory = require('../Models/inventory')(sequelize, DataTypes);
  const items = await Inventory.findAll({
    where: { userID: interaction.user.id },
    order: [ ['type', 'ASC'] ],
    raw: true,
  });
  const displayHeader = 'ID'.padEnd(5) + 'Type'.padEnd(12) + 'Name'.padEnd(20) + 'Amount';
  const displayArray = items.map(item => 
    `${item.id}`.padEnd(5) +
    `${item.type}`.padEnd(12) +
    `${item.name}`.padEnd(20) +
    `${item.amount}`)
    .join('\n');
  const actionRow = new MessageActionRow().addComponents(closeButton);
  await interaction.reply({
    content: Formatters.codeBlock(`${displayHeader}\n${displayArray}`),
    components: [actionRow],
  });
  const message = await interaction.fetchReply();
  message.originalUser = interaction.user;
  setTimeout(() => {
    if (!message.deleted) message.delete();
  }, 1000 * 60);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Displays your hero\'s inventory'),
  execute,
}