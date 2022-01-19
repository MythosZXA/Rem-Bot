const { SlashCommandBuilder } = require("@discordjs/builders");
const { Formatters, MessageButton, MessageActionRow } = require('discord.js');

const closeButton = new MessageButton()
  .setCustomId('close')
  .setLabel('Close')
  .setStyle('DANGER');

async function execute(interaction, sequelize, DataTypes) {
  // required models for inventory
  const Inventory = require('../Models/inventory')(sequelize, DataTypes);
  // get hero inventory
  const items = await Inventory.findAll({
    where: { userID: interaction.user.id },
    order: [ ['type', 'ASC'] ],
    raw: true,
  });
  // create inventory display using code block
  const displayHeader = 'ID'.padEnd(5) + 'Type'.padEnd(12) + 'Name'.padEnd(20) + 'Amount';
  const displayArray = items.map(item => 
    `${item.id}`.padEnd(5) +
    `${item.type}`.padEnd(12) +
    `${item.name}`.padEnd(20) +
    `${item.amount}`)
    .join('\n');
  // close display button
  const actionRow = new MessageActionRow().addComponents(closeButton);
  // send display
  await interaction.reply({
    content: Formatters.codeBlock(`${displayHeader}\n${displayArray}`),
    components: [actionRow],
  });
  // attach inventory related data to message
  const inventoryMessage = await interaction.fetchReply();
  inventoryMessage.buttonType = 'hero';
  inventoryMessage.originalMember = interaction.member;
  // delete message after a min
  setTimeout(async () => {
    if (inventoryMessage.content !== 'deleted') await inventoryMessage.delete();
  }, 1000 * 60);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Displays your hero\'s inventory'),
  execute,
}