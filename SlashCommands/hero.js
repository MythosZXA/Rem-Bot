const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

const closeButton = new MessageButton()
  .setCustomId('close')
  .setLabel('Close')
  .setStyle('DANGER');

async function execute(interaction, sequelize, DataTypes) {
  // required models for hero
  const Equip = require('../Models/equip')(sequelize, DataTypes);
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  // get hero data
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
    `Primary:    ${primary?.name ? primary.name : ''}\n` +
    `Secondary:  ${secondary?.name ? secondary.name : ''}\n` +
    `Helm:       ${helm?.name ? helm.name : ''}\n` +
    `Chest:      ${chest?.name ? primary.name : ''}\n` +
    `Legs:       ${legs?.name ? legs.name : ''}\n` +
    `Gloves:     ${gloves?.name ? gloves.name : ''}\n` +
    `Shoes:      ${shoes?.name ? shoes.name : ''}\n`;
  // create hero display using embed
  const heroEmbed = new MessageEmbed()
    .setTitle('Hero')
    .setDescription(`${hero.class}`)
    .addField('Overview',
    `LV: ${hero.level}
    ${hero.status}
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
  // close display button
  const actionRow = new MessageActionRow().addComponents(closeButton);
  // send display
  await interaction.reply({
    embeds: [heroEmbed],
    components: [actionRow],
  });
  // attach hero related data to the message
  const heroMessage = await interaction.fetchReply();
  heroMessage.buttonType = 'hero';
  heroMessage.originalMember = interaction.member;
  // delete message after a min
  setTimeout(async () => {
    if (heroMessage.content !== 'deleted') await heroMessage.delete();
  }, 1000 * 60);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hero')
    .setDescription('View your hero'),
  execute,
}