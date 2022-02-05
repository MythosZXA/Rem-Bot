const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const { Areas, CompletedQuests, Entities, Equip, Heroes, Quests } = require('../sequelize');
const rpgMap = require('../rpgMap');
const heroFunctions = require('../Functions/heroFunctions');

const exploreButton = new MessageButton()
  .setCustomId('explore')
  .setLabel('Explore Area')
  .setStyle('SUCCESS');
const questButton = new MessageButton()
  .setCustomId('quest')
  .setLabel('Quest')
  .setStyle('SUCCESS');
const travelButton = new MessageButton()
  .setCustomId('travel')
  .setLabel('Travel')
  .setStyle('SECONDARY');
const closeButton = new MessageButton()
  .setCustomId('close')
  .setLabel('Close')
  .setStyle('DANGER');
const attackButton = new MessageButton()
  .setCustomId('attack')
  .setLabel('Attack')
  .setStyle('SUCCESS');
const escortButton = new MessageButton()
  .setCustomId('escort')
  .setLabel('Escort')
  .setStyle('SUCCESS');
const leaveButton = new MessageButton()
  .setCustomId('close')
  .setLabel('Leave')
  .setStyle('DANGER'); 
const backButton = new MessageButton()
  .setCustomId('back')
  .setLabel('Back')
  .setStyle('SECONDARY'); 

async function execute(interaction) {
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
  // create hero display using embed
  const heroEmbed = new MessageEmbed()
    .setTitle('Hero')
    .setDescription(`${hero.class}`)
    .addFields(
      heroFunctions.createOverviewField(hero),
      heroFunctions.createStatsField(hero),
      { name: 'Equipment', value: equipValueField, inline: true },
      { name: '\u200B', value: '\u200B' },
      await heroFunctions.createAreaField(hero),
      await heroFunctions.createQuestField(hero),
    );
  // create action row
  const actionRow = new MessageActionRow()
    .addComponents(exploreButton, questButton, travelButton, closeButton);
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
  // delete message after 10 mins
  setTimeout(async () => {
    if (heroMessage.content !== 'deleted') heroMessage.delete();
  }, 1000 * 60 * 10);
}

async function explore(interaction) {
  // determine which type of location the hero is in
  const hero = interaction.message.hero;
  const area = await Areas.findAll({ where: { name: hero.location }, raw: true });
  // explore based on location
  switch (area[0].type) {
    case 'Town':
      const exploreEmbed = new MessageEmbed()
        .setTitle('You took a stroll around the town');
      const actionRow = new MessageActionRow().addComponents(backButton);
      interaction.update({ embeds: [exploreEmbed], components: [actionRow] });
      break;
    case 'Field':
      // get entities in field
      const areaField = await heroFunctions.createAreaField(hero);
      const monsters = areaField.value.split('\n');
      monsters.pop();                                   // remove trailing empty index
      // determine which entity to encounter
      const encounterID = Math.floor(Math.random() * monsters.length);
      encounterEntity(interaction, monsters[encounterID]);
      break;
  }
}

async function encounterEntity(interaction, entityName) {
  // get info to create display embed
  const userID = interaction.user.id;
  const hero = await Heroes.findOne({ where: { userID: userID }, raw: true });
  const entity = await Entities.findOne({ where: { name: entityName }, raw: true });
  // create display embed & action row depending on npc or monster
  if (!entity.health) {                                 // npc
    // create display embed
    const encounterEmbed = new MessageEmbed()
      .setTitle(entity.name)
      .setDescription(entity.collection);
    // create action row
    const actionRow = new MessageActionRow()
      .addComponents(escortButton, leaveButton);
    // update message to display encounter
    interaction.update({ embeds: [encounterEmbed], components: [actionRow] });
    // attach info to message if hero interacts with npc
    interaction.message.npc = entity;
    interaction.message.destination = entity.drops;
  } else {                                              // monster
    // create display embed
    const battleEmbed = createBattleEmbed(hero, entity);
    // create action row
    const actionRow = new MessageActionRow()
      .addComponents(attackButton, leaveButton);
    // update message to display encounter
    interaction.update({ embeds: [battleEmbed], components: [actionRow] });
    // attach info to message if hero enters battle
    interaction.message.monster = entity;
  }
  
}

function createBattleEmbed(hero, monster, battleMessages) {
  const battleEmbed = new MessageEmbed()
    .setColor('RED')
    .setTitle(`You encountered a ${monster.name}`)
    .addField('Hero', `💟 ${hero.health}\n💠 ${hero.mana}`, true)
    .addField('🆚', '---\n---', true)
    .addField(monster.name, `💟 ${monster.health}`, true);
  if (battleMessages) battleEmbed.addField('Messages', battleMessages);
  return battleEmbed;
}

async function simulateBattle(interaction, monster) {
  // get info for battle
  const userID = interaction.user.id;
  let hero = await Heroes.findOne({ where: { userID: userID }, raw: true });
  interaction.message.battleMessages = '';
  // simulate battle
  simulateAttack(interaction, hero, monster);
  if (await checkVictory(interaction, monster)) return;
  await simulateBeingHit(interaction, monster);
  if (await checkDefeat(interaction, monster)) return;
  // no victory or defeat, update battle status
  // create display embed
  hero = await Heroes.findOne({ where: { userID: userID }, raw: true });
  const battleMessages = interaction.message.battleMessages;
  const battleEmbed = createBattleEmbed(hero, monster, battleMessages);
  // create action row
  const actionRow = new MessageActionRow().addComponents(attackButton, leaveButton);
  // update message to confirm battle exchange
  interaction.update({ embeds: [battleEmbed], components: [actionRow] });
}

function simulateAttack(interaction, hero, monster) {
  let battleMessages = '';
  const simulateCrit = Math.random() * (100 - 1) + 1;         // determine if crit
  let finalDamage = hero.strength;
  if (simulateCrit <= hero.crit_rate) {                       // crit
    finalDamage += (hero.strength +                           // regular dmg
      (hero.strength * hero.crit_damage / 100)) *             // crit portion
      (1 - (monster.defense / 1000));                         // monster defense
    battleMessages += `Dealt ${finalDamage} crit damage!\n`;
  } else {                                                    // didn't crit
    finalDamage *= (1 - (monster.defense / 1000));
    battleMessages += `Dealt ${finalDamage} damage!\n`;
  }
  monster.health -= finalDamage;
  interaction.message.battleMessages += battleMessages;
}

async function checkVictory(interaction, monster) {
  // check if monster has been defeated
  if (monster.health <= 0) {                                  // monster defeated
    monster.health = 0;                                       // prevent display of negative health
    const userID = interaction.user.id;
    await Heroes.increment(                                   // increase exp & credits
      { exp: +monster.exp, credits: +monster.credits },
      { where: { userID: userID } },
    );
    let battleMessages = '';
    battleMessages += `Defeated ${monster.name}, gaining ` +
      `${monster.exp} exp and ${monster.credits} credits!\n`;
    await checkLevelUp(interaction);
    // create display embed
    const hero = await Heroes.findOne({ where: { userID: userID }, raw: true });
    interaction.message.battleMessages += battleMessages;
    const battleEmbed = createBattleEmbed(hero, monster, battleMessages);
    // create action row
    const actionRow = new MessageActionRow().addComponents(closeButton);
    // update message to confirm hero's victory
    interaction.update({ embeds: [battleEmbed], components: [actionRow] });
    return true;
  } else {                                                    // monster not defeated
    return false;
  }
}

async function checkLevelUp(interaction) {
  // get hero that is being checked
  const userID = interaction.user.id;
  const hero = await Heroes.findOne({ where: { userID: userID }, raw: true });
  // check if exp is higher than threshold
  const requiredEXP = Math.floor(100 * Math.pow(1.05, hero.level));
  if (hero.exp >= requiredEXP) {                              // level up
    await Heroes.increment(                                   // increase stats
      { level: +1, exp: -requiredEXP, max_health: +5, strength: +1, defense: +1 },
      { where: { userID: userID } },
    );
    let battleMessages = '';
    battleMessages += 'Your hero leveled up!!!\n';
    interaction.message.battleMessages += battleMessages;
  }
}

async function simulateBeingHit(interaction, monster) {
  // get info to simulate
  const userID = interaction.user.id;
  const hero = await Heroes.findOne({ where: { userID: userID }, raw: true });
  const finalDamage = monster.strength * (1 - (hero.defense / 1000));
  await Heroes.increment(                                     // decrease health
    { health: -finalDamage },
    { where: { userID: userID } },
  );
  let battleMessages = '';
  battleMessages += `Received ${finalDamage} damage\n`;
  interaction.message.battleMessages += battleMessages;
}

async function checkDefeat(interaction, monster) {
  // get info to check hero's defeat
  const userID = interaction.user.id;
  let hero = await Heroes.findOne({ where: { userID: userID }, raw: true });
  // check if hero was defeated
  if (hero.health <= 0) {                                     // hero defeated
    await Heroes.update(                                      // update condition
      { health: 0, status: 'Recovering' },
      { where: { userID: userID } },
    );
    let battleMessages = ''
    battleMessages += 'Your hero has been defeated!';
    interaction.message.battleMessages += battleMessages;
    // create display embed
    hero = await Heroes.findOne({ where: { userID: userID }, raw: true });
    battleMessages = interaction.mesage.battleMessages;
    const battleEmbed = createBattleEmbed(hero, monster, battleMessages);
    // create action row
    const actionRow = new MessageActionRow().addComponents(closeButton);
    // update message to confirm hero's defeat
    interaction.update({ embeds: [battleEmbed], components: [actionRow] });
    return true;
  } else {                                                    // hero not defeated
    return false;
  }
}

async function quest(interaction) {
  // get quests in area
  const availableQuests = interaction.message.embeds[0].fields[5].value.split('\n');
  // create a display embed for quests
  const questEmbed = new MessageEmbed()
    .setTitle('Available Quests')
  if (availableQuests.includes('None')) {                     // no quests
    questEmbed.setDescription('No available quest in this area');
  } else {                                                    // add each quest to embed
    await new Promise(resolve => {
      if (availableQuests.length === 0) resolve();
      availableQuests.forEach(async (availableQuest, index) => {
        const { description } = await Quests.findOne({ where: { name: availableQuest }, raw: true });
        questEmbed.addField(availableQuest, ` - ${description}`);
        if (index === availableQuests.length - 1) resolve();
      });
    });
  }
  
  
  // create action row
  const actionRow = new MessageActionRow()
    .addComponents(backButton);
  // update message to display quests
  interaction.update({
    embeds: [questEmbed],
    components: [actionRow],
  });
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

function move(interaction) {
  // determine if hero is travelling or escorting
  const escorting = interaction.message.npc;
  const destinationName = (escorting ? interaction.message.destination : interaction.component.label);
  const displayEmbed = new MessageEmbed()
    .setDescription(`${escorting ? 'Escorting' : 'Traveling'} to ${destinationName}...`);
  // update message to confirm hero's departure
  interaction.update({ embeds: [displayEmbed], components: [] });
  // update message on destination arrival
  setTimeout(async () => {
    // update hero's location data
    const userID = interaction.user.id;
    Heroes.update(
      { location: destinationName },
      { where: { userID: userID } },
    );
    // create display embed and action row
    displayEmbed.setDescription(`Your hero has arrived at ${destinationName}`);
    const actionRow = new MessageActionRow().addComponents(closeButton);
    // update hero's stats if completing an escort
    if (escorting) {
      const escortQuest = await Quests.findOne({ where: { name: escorting.name }, raw: true });
      Heroes.increment(
        { exp: +escortQuest.exp, credits: +escortQuest.credits },
        { where: { userID: userID } },
      );
      displayEmbed.setDescription(`Escort to ${destinationName} complete, ` +
        `gaining ${escortQuest.exp} exp and ${escortQuest.credits} credits`);
      // set quest as complete
      CompletedQuests.upsert({ userID: userID, name: escorting.name, location: destinationName });
    }
    // update message to confirm hero's arrival
    interaction.message.edit({ embeds: [displayEmbed], components: [actionRow] });
  }, 1000 * 60);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hero')
    .setDescription('View your hero'),
  execute,
  explore,
  encounterEntity,
  simulateBattle,
  quest,
  travel,
  move,
};