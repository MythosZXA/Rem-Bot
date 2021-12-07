const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

// create buttons for action rows
const attackButton = new MessageButton()
  .setCustomId('attack')
  .setLabel('Attack')
  .setStyle('PRIMARY');
const nextFloorButton = new MessageButton()
  .setCustomId('nextFloor')
  .setLabel('Next Floor')
  .setStyle('PRIMARY');
const leaveButton = new MessageButton()
  .setCustomId('leave')
  .setLabel('Leave')
  .setStyle('DANGER');

async function execute(interaction, sequelize, DataTypes) {
  // check if hero isn't busy
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  let busy;
  await Hero.findOne(
    { 
      where: { userID: interaction.user.id },
      attributes: ['busy'],
      raw: true,
    })
    .then(busyMap => busy = busyMap.busy);
  if (busy == 1) {
    await interaction.reply({
      content: 'Your hero is currently busy with another task!',
      ephemeral: true,
    });
    return;
  }
  // get data required for this battle
  const Dungeon = require('../Models/dungeons')(sequelize, DataTypes);
  const Monster = require('../Models/monsters')(sequelize, DataTypes);
  const hero = await Hero.findOne({ where: { userID: interaction.user.id }, raw: true });
  let currentDungeon;
  let currentFloor = 1;
  if (interaction.commandName == 'dungeons') {
    await Hero.update(
      { busy: 1 },
      { where: { userID: interaction.user.id } },
    );
    currentDungeon = interaction.options.getNumber('dungeon');
  } else {
    currentDungeon = interaction.message.currentDungeon;
    currentFloor = interaction.message.currentFloor;
  }
  const monsterIDMap = await Dungeon.findOne(
    {
      where: { dungeon: currentDungeon, floor: currentFloor }, 
      attributes: ['monsterID'],
      raw: true
    });
  const monster = await Monster.findOne({ where: { monsterID: monsterIDMap.monsterID }, raw: true });
  // create battle display using embed
  const battleEmbed = new MessageEmbed()
    .setColor('#FF0000')
    .setTitle(`Floor ${currentFloor}`)
    .addField('Hero',
    `♥️ ${hero.health}
    🔷 ${hero.mana}`,
    true)
    .addField('VS', '---\n---', true)
    .addField(monster.name,
      `♥️ ${monster.health}`,
    true);
  // create button row for battle interaction
  const actionRow = new MessageActionRow().addComponents(attackButton, leaveButton);
  // display to discord
  await interaction.reply({
    embeds: [battleEmbed],
    components: [actionRow],
  });
  // attach dungeon related variables to the message
  const message = await interaction.fetchReply();
  message.originalUser = interaction.user;
  message.currentDungeon = currentDungeon;
  message.currentFloor = currentFloor;
  await Dungeon.findAll({ where: { dungeon: currentDungeon }, raw: true })
    .then(floorsMap => message.numFloors = floorsMap.length);
  message.monster = monster;
  // delete message if not interacted with
  setTimeout(() => {

  }, )
}

async function attack(interaction, sequelize, DataTypes) {
  // get data required for this battle
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  const message = interaction.message;
  const monster = message.monster;
  let hero = await Hero.findOne({ where: { userID: interaction.user.id }, raw: true });
  // attack
  const critChance = Math.random() * (101 - 1) + 1;
  let crit = false;
  if (critChance <= hero.crit_rate) {
    monster.health -= hero.strength * 1.5;
    crit = true;
  } else {
    monster.health -= 10;
  }
  // receive attack
  await Hero.increment(
    { health: -monster.strength },
    { where: { userID: interaction.user.id } }
  );
  // update hero instance after battle exchange
  hero = await Hero.findOne({ where: { userID: interaction.user.id }, raw: true });
  // update battle display using embed
  const battleEmbed = new MessageEmbed()
    .setColor('#FF0000')
    .setTitle(`Floor ${message.currentFloor}`)
    .addField('Hero',
    `♥️ ${hero.health}
    🔷 ${hero.mana}`,
    true)
    .addField('VS', '---\n---', true)
    .addField(monster.name,
      `♥️ ${monster.health}`,
    true);
    // create button row for battle interaction
  let actionRow = new MessageActionRow();
  // add battle messages to embed
  if (crit) {
    battleEmbed.addField('Message', `Dealt ${hero.strength * 1.5} crit damage!\n`);
  } else {
    battleEmbed.addField('Message', `Dealt ${hero.strength} damage\n`);
  }
  let valueField = battleEmbed.fields[3].value;
  valueField += `Received ${monster.strength} damage\n`;
  // check if monster is defeated with this attack
  if (monster.health <= 0) {
    // update rewards if victorious
    await Hero.increment(
      { 
        exp: +monster.exp,
        credits: +monster.credits,
      },
      { where: {userID: interaction.user.id } }
    );
    // add battle messages to embed
    valueField += `Defeated ${monster.name}!\n`;
    valueField += `Gained ${monster.exp} experience and received ${monster.credits} credits!`;
    battleEmbed.spliceFields(3, 1, {name: 'Message', value: valueField});
    // check if there are more floors of the dungeon
    if (message.currentFloor < message.numFloors) {
      actionRow.addComponents(nextFloorButton, leaveButton);
    } else if (message.currentFloor == message.numFloors) {
      actionRow.addComponents(leaveButton);
    }
    // display to discord
    await interaction.update({
      embeds: [battleEmbed],
      components: [actionRow],
    });
  } else { // monster haven't been defeated
    // update embed and action row
    battleEmbed.spliceFields(3, 1, {name: 'Message', value: valueField});
    actionRow.addComponents(attackButton, leaveButton);
    // display to discord
    await interaction.update({
      embeds: [battleEmbed],
      components: [actionRow],
    });
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dungeons')
    .setDescription('Run a dungeon (solo)')
    .addNumberOption(option =>
      option.setName('dungeon')
        .setDescription('Dungeon #')
        .setRequired(true)
        .addChoice('1', 1)),
    execute,
    attack,
}