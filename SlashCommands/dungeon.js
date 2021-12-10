const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton } = require("discord.js");
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
  // required models for battle
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  const Dungeon = require('../Models/dungeons')(sequelize, DataTypes);
  const Monster = require('../Models/monsters')(sequelize, DataTypes);
  // check if hero is available
  if (await dungeonFunctions.checkStatus(interaction ,Hero) != 0) return;
  else await Hero.update({ status: 'Busy' }, { where: { userID: interaction.user.id } });
  // get data required for this battle
  const hero = await Hero.findOne({ where: { userID: interaction.user.id }, raw: true });
  let currentDungeon, currentStage;                           // values representing state of dungeon
  if (interaction.commandName == 'dungeon') {                 // data is attached to slash command
    currentDungeon = interaction.options.getNumber('number');
    currentStage = 1;
  } else {                                                    // data is attached to message
    currentDungeon = interaction.message.currentDungeon;
    currentStage = interaction.message.currentStage;
  }
  const { monsterID } = await Dungeon.findOne({               // get monster on this stage
      where: { dungeon: currentDungeon, stage: currentStage }, 
      attributes: ['monsterID'],
      raw: true
    });
  const monster = await Monster.findOne({ where: { monsterID: monsterID }, raw: true });
  // create battle display using embed
  const battleEmbed = dungeonFunctions.createBattleEmbed(hero, monster, currentStage);
  battleEmbed.addField('Message', `Entered stage ${currentStage}\n`);
  // create button row for battle interaction
  const actionRow = new MessageActionRow().addComponents(attackButton, leaveButton);
  // display to discord
  if (interaction.commandName == 'dungeon') {                 // reply to slash command
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
  if (interaction.commandName == 'dungeon') {
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
  message.numStage = (await Dungeon.findAll({ where: { dungeon: currentDungeon }, raw: true })).length;
  message.messageField = battleEmbed.fields[3].value; 
  // delete message if not interacted with
  setTimeout(() => {

  }, )
}

async function attack(interaction, sequelize, DataTypes) {
  // get data required for this battle
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  let hero = await Hero.findOne({ where: { userID: interaction.user.id }, raw: true });
  const message = interaction.message;
  const monster = message.monster;
  message.messageField = '';                                  // reset message field
  let actionRow = new MessageActionRow();
  // simulate battle
  await dungeonFunctions.simulateAttack(hero, monster, message);
  // check monster condition after attacking
  if (monster.health <= 0) {                                  // monster defeated
    await dungeonFunctions.simulateVictory(interaction, Hero, monster, message);
    await dungeonFunctions.simulateDrops(interaction, monster, message, sequelize, DataTypes);
    // check if there are more stages of the dungeon
    if (message.currentStage < message.numStage) {            // more stages available
      actionRow.addComponents(nextStageButton, leaveButton);
    } else if (message.currentStage == message.numStage) {    // completed last stage
      actionRow.addComponents(leaveButton);
    }
  } else {                                                    // monster not defeated, battle continues
    await dungeonFunctions.simulateBeingHit(interaction, Hero, monster, message);
    // update hero instance after being attacked
    hero = await Hero.findOne({ where: { userID: interaction.user.id }, raw: true });
    // check hero condition after receiving attack
    if (hero.health <= 0) {                                   // hero defeated
      await dungeonFunctions.simulateDefeat(interaction, Hero, message);
      actionRow.addComponents(leaveButton);
    } else {                                                  // hero not defeated, battle continues
      actionRow.addComponents(attackButton, leaveButton);
    }
  }
  // display battle simulation
  hero = await Hero.findOne({ where: { userID: interaction.user.id }, raw: true });
  const battleEmbed = dungeonFunctions.createBattleEmbed(hero, monster, message.currentStage);
  battleEmbed.spliceFields(3, 1, {name: 'Message', value: message.messageField});
  await interaction.update({
    embeds: [battleEmbed],
    components: [actionRow],
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dungeon')
    .setDescription('Run a dungeon (solo)')
    .addNumberOption(option =>
      option.setName('number')
        .setDescription('Dungeon number')
        .setRequired(true)
        .addChoice('1', 1)),
    execute,
    attack,
}