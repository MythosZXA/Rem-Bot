const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const dungeonFunctions = require('../Functions/dungeonFunctions');

// create buttons for action rows
const attackButton = new MessageButton()
  .setCustomId('attack')
  .setLabel('Attack')
  .setStyle('PRIMARY');
const nextStageButton = new MessageButton()
  .setCustomId('nextStage')
  .setLabel('Next Stage')
  .setStyle('PRIMARY');
const leaveButton = new MessageButton()
  .setCustomId('leave')
  .setLabel('Leave')
  .setStyle('DANGER');

async function execute(interaction, sequelize, DataTypes) {
  // get models required for this battle
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  const Dungeon = require('../Models/dungeons')(sequelize, DataTypes);
  const Monster = require('../Models/monsters')(sequelize, DataTypes);
  // check if hero is busy (and can't do this dungeon)
  if (await dungeonFunctions.checkBusy(Hero, interaction)) return;
  else await Hero.update({ busy: 1 }, { where: { userID: interaction.user.id } });
  // get data required for this battle
  const hero = await Hero.findOne({ where: { userID: interaction.user.id }, raw: true });
  let currentDungeon, currentStage;
  if (interaction.commandName == 'dungeons') {                // first execution (slash)
    currentDungeon = interaction.options.getNumber('dungeon');
    currentStage = 1;
  } else {                                                    // following execution (button)
    currentDungeon = interaction.message.currentDungeon;
    currentStage = interaction.message.currentStage;
  }
  const monsterIDMap = await Dungeon.findOne({
      where: { dungeon: currentDungeon, stage: currentStage }, 
      attributes: ['monsterID'],
      raw: true
    });
  const monster = await Monster.findOne({ where: { monsterID: monsterIDMap.monsterID }, raw: true });
  // create battle display using embed
  const battleEmbed = dungeonFunctions.createBattleEmbed(hero, monster, currentStage);
  battleEmbed.addField('Message', `Entered stage ${currentStage}\n`);
  // create button row for battle interaction
  const actionRow = new MessageActionRow().addComponents(attackButton, leaveButton);
  // display to discord
  if (interaction.commandName == 'dungeons') {                // reply to slash command
    await interaction.reply({
      embeds: [battleEmbed],
      components: [actionRow],
    });
  } else {
    await interaction.message.edit({                          // reply exists, edit
      embeds: [battleEmbed],
      components: [actionRow],
    });
  }
  // get message to attach variables
  let message;
  if (interaction.commandName == 'dungeons') {
    message = await interaction.fetchReply();                 // message is the reply to slash command
    message.originalUser = interaction.user;
  } else {
    message = await interaction.message;                      // message is attached to this button
    await interaction.reply({                                 // reply so button interaction don't fail
      content: 'Moving to next stage',
      ephermeral: true,
    });
    await interaction.deleteReply();
    message.messageField = '';                                // reset message field in embed
  }
  // attach dungeon related variables to the message
  message.monster = monster;
  message.currentDungeon = currentDungeon;
  message.currentStage = currentStage;
  await Dungeon.findAll({ where: { dungeon: currentDungeon }, raw: true })
    .then(stageMap => message.numStage = stageMap.length);    // length of array = # of stages
  message.messageField = battleEmbed.fields[3].value; 
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
  const critChance = Math.random() * (100 - 1) + 1;
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
  const battleEmbed = dungeonFunctions.createBattleEmbed(hero, monster, message.currentStage);
  // create button row for battle interaction
  let actionRow = new MessageActionRow();
  // add battle messages to embed
  if (crit) {
    message.messageField += `Dealt ${hero.strength * 1.5} crit damage!\n`;
  } else {
    message.messageField += `Dealt ${hero.strength} damage\n`;
  }
  message.messageField += `Received ${monster.strength} damage\n`;
  // check if monster is defeated with this attack
  if (monster.health <= 0) {                                  // monster defeated
    await Hero.increment(                                     // update rewards
      { exp: +monster.exp, credits: +monster.credits },
      { where: {userID: interaction.user.id } }
    );
    // add battle messages to embed
    message.messageField += `Defeated ${monster.name}!\n`;
    message.messageField += `Gained ${monster.exp} experience and received ${monster.credits} credits!`;
    battleEmbed.spliceFields(3, 1, {name: 'Message', value: message.messageField});
    // check if there are more stages of the dungeon
    if (message.currentStage < message.numStage) {
      actionRow.addComponents(nextStageButton, leaveButton);
    } else if (message.currentStage == message.numStage) {
      actionRow.addComponents(leaveButton);                   // no attack button bc monster defeated
    }
    // display to discord
    await interaction.update({
      embeds: [battleEmbed],
      components: [actionRow],
    });
  } else {                                                    // monster haven't been defeated
    // update embed and action row
    battleEmbed.spliceFields(3, 1, {name: 'Message', value: message.messageField});
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