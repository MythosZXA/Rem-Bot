const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

async function execute(interaction, sequelize, DataTypes) {
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  const [hero, created] = await Hero.findOrCreate({ where: { userID: interaction.user.id }, raw: true });
  const heroEmbed = new MessageEmbed()
    .setTitle('Hero')
    .setDescription('tbd class')
    .addField('Overview',
    `✳️ ${hero.exp}
    🪙 ${hero.credits}`,
    true)
    .addField('Stats',
    `💟 ${hero.health}
    💠 ${hero.mana}
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
  await interaction.reply({
    embeds: [heroEmbed],
    ephemeral: true,
  })
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hero')
    .setDescription('View your hero'),
  execute
}