const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const heroFunctions = require('../Functions/heroFunctions');
const rpgMap = require('../rpgMap');

const exploreButton = new MessageButton()
  .setCustomId('explore')
  .setLabel('Explore Area')
  .setStyle('SUCCESS');
const travelButton = new MessageButton()
  .setCustomId('travel')
  .setLabel('Travel')
  .setStyle('SECONDARY')
const closeButton = new MessageButton()
  .setCustomId('close')
  .setLabel('Close')
  .setStyle('DANGER');
const backButton = new MessageButton()
  .setCustomId('back')
  .setLabel('Back')
  .setStyle('SECONDARY');

async function execute(interaction, sequelize, DataTypes) {
  // required models for this function
  const Equip = require('../Models/equip')(sequelize, DataTypes);
  const Areas = require('../Models/areas')(sequelize, DataTypes)
  const Heroes = require('../Models/heroes')(sequelize, DataTypes);
  // get hero data
  const userID = interaction.user.id;
  const [hero, created] = await Heroes.findOrCreate({ where: { userID: userID }, raw: true });
  const equipped = await Equip.findAll({
    where: { userID: userID },
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
  // create area display field
  const area = await Areas.findAll({ where: { name: hero.location}, raw: true });
  const entityField = await heroFunctions.getArea(area);
  // create quest display field
  const availableQuestsField = await heroFunctions.getQuests(userID, hero.location, sequelize, DataTypes);
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
    .addField('Equipment', equipValueField, true)
    .addField('\u200B', '\u200B')
    .addField(`${hero.location} (${area[0].type})`, entityField, true)
    .addField('Quests', availableQuestsField, true);
  // create action row
  const actionRow = new MessageActionRow()
    .addComponents(exploreButton, travelButton, closeButton);
  // send display
  const heroMessage = await interaction.reply({
    embeds: [heroEmbed],
    components: [actionRow],
    fetchReply: true,
  });
  // attach hero related data to the message
  heroMessage.buttonType = 'hero';
  heroMessage.originalMember = interaction.member;
  heroMessage.hero = hero;
  heroMessage.heroEmbed = heroEmbed;
  heroMessage.actionRow = actionRow;
  // delete message after 5 mins
  setTimeout(async () => {
    if (heroMessage.content !== 'deleted') heroMessage.delete();
  }, 1000 * 60 * 5);
}

async function explore(interaction, sequelize, DataTypes) {
  // required models for this function
  const Areas = require('../Models/areas')(sequelize, DataTypes);
  const Heroes = require('../Models/heroes')(sequelize, DataTypes);
  const Monsters = require('../Models/monsters')(sequelize, DataTypes);
  // determine which type of location the hero is in
  const heroLocation = interaction.message.hero?.location;
  const area = await Areas.findOne({ where: { name: heroLocation }, raw: true });
  // explore based on location
  const exploreEmbed = new MessageEmbed();
  const actionRow = new MessageActionRow().addComponents(backButton);
  switch (area.type) {
    case 'Town':
      exploreEmbed.setTitle('You took a stroll around the town');
      interaction.update({ embeds: [exploreEmbed], components: [actionRow] });
      break;
    case 'Field':
      break;
  }
}

function travel(interaction) {
  // get the adjacent areas to the hero's location
  const hero = interaction.message.hero;
  const adjacentAreas = rpgMap.get(hero.location);
  // create areas display using embed
  const displayEmbed = new MessageEmbed()
    .setDescription(adjacentAreas.join('\n'));
  // create buttons & action row for area traversal
  const actionRow = new MessageActionRow();
  adjacentAreas.forEach(area => {
    const areaButton = new MessageButton()
      .setCustomId('move')
      .setLabel(area)
      .setStyle('SUCCESS');
    actionRow.addComponents(areaButton)
  });
  actionRow.addComponents(backButton);
  interaction.update({
    embeds: [displayEmbed],
    components: [actionRow],
  });
}

function move(interaction, sequelize, DataTypes) {
  // required models for this function
  const Heroes = require('../Models/heroes')(sequelize, DataTypes);
  // update message to confirm hero's traveling
  const destinationName = interaction.component.label;
  const displayEmbed = new MessageEmbed()
    .setDescription(`Your hero started traveling to ${destinationName} and will arrive in 1 minute`);
  interaction.update({ embeds: [displayEmbed], components: [] });
  // update message on destination arrival
  setTimeout(() => {
    // update hero's location data
    const userID = interaction.user.id;
    Heroes.update(
      { location: destinationName },
      { where: { userID: userID } },
    );
    // update message to confirm hero's arrival
    displayEmbed.setDescription(`Your hero has arrived at ${destinationName}`);
    const actionRow = new MessageActionRow().addComponents(closeButton);
    interaction.message.edit({ embeds: [displayEmbed], components: [actionRow] });
  }, 1000 * 60);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hero')
    .setDescription('View your hero'),
  execute,
  explore,
  travel,
  move,
};