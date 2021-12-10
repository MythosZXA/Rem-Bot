const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

const closeButton = new MessageButton()
  .setCustomId('close')
  .setLabel('Close')
  .setStyle('DANGER');

async function execute(interaction, sequelize, DataTypes) {
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  const [hero, created] = await Hero.findOrCreate({ where: { userID: interaction.user.id }, raw: true });
  const heroEmbed = new MessageEmbed()
    .setTitle('Hero')
    .setDescription(`${hero.class}`)
    .addField('Overview',
    `${hero.status}
    ✳️ ${hero.exp}
    🪙 ${hero.credits}`,
    true)
    .addField('Stats',
    `💟 ${hero.health}
    💠 ${hero.mana}
    ⚔️ ${hero.strength}
    🛡️ ${hero.defense}
    💥 ${hero.crit_rate}%`,
    true)
    .addField('Equipment',
    `Primary:
    Secondary:
    Helm:
    Chest:
    Legs:
    Gloves:
    Shoes:`,
    true);
  const actionRow = new MessageActionRow().addComponents(closeButton);
  await interaction.reply({
    embeds: [heroEmbed],
    components: [actionRow],
  });
  const message = await interaction.fetchReply();
  message.originalUser = interaction.user;
  setTimeout(() => {
    message.delete();
  }, 1000 * 60);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hero')
    .setDescription('View your hero'),
  execute,
}