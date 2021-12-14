const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

const closeButton = new MessageButton()
  .setCustomId('close')
  .setLabel('Close')
  .setStyle('DANGER');

async function execute(interaction, sequelize, DataTypes) {
  const Equip = require('../Models/equip')(sequelize, DataTypes);
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  const [hero, created] = await Hero.findOrCreate({ where: { userID: interaction.user.id }, raw: true });
  const equipped = await Equip.findAll({
    where: { userID: interaction.user.id },
    order: [ ['type', 'DESC'] ],
    raw: true
  });
  // create equip display field
  const primary = equipped.find(primary => primary?.type == 'Primary');
  const secondary = equipped.find(secondary => secondary?.type == 'Secondary');
  const helm = equipped.find(helm => helm?.type == 'Helm');
  const chest = equipped.find(chest => chest?.type == 'Chest');
  const legs = equipped.find(legs => legs?.type == 'Legs');
  const gloves = equipped.find(gloves => gloves?.type == 'Gloves');
  const shoes = equipped.find(shoes => shoes?.type == 'Shoes');
  const equipValueField = 
    `Primary: `.padEnd(12) + `${primary?.name ? primary.name : ''}\n` +
    `Secondary: `.padEnd(12) + `${secondary?.name ? secondary.name : ''}\n` +
    `Helm: `.padEnd(12) + `${helm?.name ? helm.name : ''}\n` +
    `Chest: `.padEnd(12) + `${chest?.name ? primary.name : ''}\n` +
    `Legs: `.padEnd(12) + `${legs?.name ? legs.name : ''}\n` +
    `Gloves: `.padEnd(12) + `${gloves?.name ? gloves.name : ''}\n` +
    `Shoes: `.padEnd(12) + `${shoes?.name ? shoes.name : ''}\n`;
  // create embeb
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
    .addField('Equipment', equipValueField, true);
  const actionRow = new MessageActionRow().addComponents(closeButton);
  await interaction.reply({
    embeds: [heroEmbed],
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
    .setName('hero')
    .setDescription('View your hero'),
  execute,
}