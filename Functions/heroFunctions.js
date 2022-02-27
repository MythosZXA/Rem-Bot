const { MessageEmbed } = require('discord.js');
const { Areas, CompletedQuests, Quests } = require('../sequelize');

function checkStatus(interaction, status) {
  if (status !== 'Good') {
    interaction.reply({
      content: `Your hero is currently ${status} and cannot perform this action right now`,
      ephemeral: true,
    });
    return false;
  } else {
    return true;
  }
}

function createOverviewField(hero) {
  return {
    name: 'Overview',
    value: 
      `LV: ${hero.level}
      ${hero.status}
      ✳️ ${hero.exp}
      🪙 ${hero.credits}`,
    inline: true,
  }
}

function createStatsField(hero) {
  return {
    name: 'Stats',
    value:
      `💟 ${hero.health}
      💠 ${hero.mana}
      ⚔️ ${hero.strength}
      🛡️ ${hero.defense}
      💥 ${hero.crit_rate}%`,
    inline: true,
  }
}

async function createAreaField(hero) {
  // get info to create field
  const userID = hero.userID;
  const area = await Areas.findAll({ where: { name: hero.location }, raw: true });
  const finishedQuests = await CompletedQuests.findAll({
    where: { userID: userID },
    raw: true,
  });
  // create area value field
  let entityField = '';
  if (area[0].type !== 'Town') {                           // field-type area, add entities
    area.forEach(area => {
      if (finishedQuests.find(quest => quest.name === area.entity)) return;
      entityField += `${area.entity}\n`
    });
  }
  if (entityField === '') entityField = 'None';
  // return area field
  return {
    name: `${hero.location} (${area[0].type})`,
    value: entityField,
    inline: true,
  }
}

async function createQuestField(hero) {
  const userID = hero.userID;
  // get available quest in this location
  const availableQuests = (await Quests.findAll({
    attributes: ['name'],
    where: { location: hero.location },
    raw: true,
  })).map(model => model.name);
  // get quests completed by hero in this location
  const finishedQuests = (await CompletedQuests.findAll({
    attributes: ['name'],
    where: { userID: userID, location: hero.location},
    raw: true,
  })).map(model => model.name);
  // create a field to display uncompleted quests
  let uncompletedField = '';
  availableQuests.forEach(availableQuest => {               // add uncompleted quests to display string
    if (!finishedQuests.find(finishedQuest => finishedQuest === availableQuest)) {
      uncompletedField += `${availableQuest}\n`;
    }
  });
  if (uncompletedField === '') uncompletedField = 'None';   // no quest available
  // return quest field
  return {
    name: 'Quests',
    value: uncompletedField,
    inline: true,
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

async function updateClass(interaction, Heroes, Equip) {
  try {
    const { name : primaryWeapon } = await Equip.findOne({           // get primary weapon
      where: {
        userID: interaction.user.id,
        type: 'Primary',
      },
      raw: true,
    });
    const { name : secondaryWeapon } = await Equip.findOne({         // get secondary weapon
      where: {
        userID: interaction.user.id,
        type: 'Secondary',
      },
      raw: true,
    });
     // determine which class to change to
  let newClass = 'Adventurer';
  if (primaryWeapon.includes('Sword')) {                             // sword primary
    if (secondaryWeapon.includes('Shield')) {                        // shield secondary
      newClass = 'Guardian';
    } else if (secondaryWeapon.includes('Sword')) {                  // sword secondary
      newClass = 'Striker';
    } else if (secondaryWeapon.includes('Arcane')) {                 // arcane secondary
      newClass = 'Mystic';
    }
  } else if (primaryWeapon.includes('Bow')) {                        // bow primary
    if (secondaryWeapon.includes('Arrows')) {                        // arrow secondary
      newClass = 'Archer';
    } else if (secondaryWeapon.includes('Arcane')) {                 // arcane secondary
      newClass = 'Oracle';
    }
  } else if (primaryWeapon.includes('Staff')) {                      // staff primary
    if (secondaryWeapon.includes('Arcane')) {                        // arcane secondary
      newClass = 'Sorcerer';
    }
  } else if (primaryWeapon.includes('Dagger')) {                     // dagger primary
    if (secondaryWeapon.includes('Dagger')) {                        // dagger secondary
      newClass = 'Assassin';
    }
  } else if (primaryWeapon.includes('Greatsword')) {                 // greatsword primary
    if (secondaryWeapon.includes('Imprint')) {                       // imprint secondary
      newClass = 'Slayer';
    }
  }
  // change class
  await Heroes.update(
    { class: newClass },
    { where: { userID: interaction.user.id } },
  );
  } catch (error) {
    if (error instanceof TypeError) {                                // one weapon is empty, ignore
      return;
    }
  }
}

module.exports= {
  checkStatus,
  createOverviewField,
  createStatsField,
  createAreaField,
  createQuestField,
  createBattleEmbed,
  updateClass,
};