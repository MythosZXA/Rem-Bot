const { sequelize, Areas, CompletedQuests, Heroes, Quests } = require('../sequelize');
const { Op } = require('sequelize');

function recoverHealth() {
  setInterval(() => {
    // recover the health of heroes that aren't max
    Heroes.increment(
      { health: +1 },
      { where: { health: { [Op.lt]: sequelize.col('max_health') } } },
    );
    // update the status of recovering heroes at max health
    Heroes.update(
      { status: 'Good' },
      { where: { status: 'Recovering', health: { [Op.eq]: sequelize.col('max_health') } } }
    );
  }, 1000 * 5);
}

function recoverMana() {
  // recover the mana of heroes that aren't max
  setInterval(() => {
    Heroes.increment(
      { mana: +1 },
      { where: { mana: { [Op.lt]: sequelize.col('max_mana') } } },
    );
  }, 1000 * 3);
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
  if (area[0].type === 'Field') {                           // field-type area, add entities
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
  recoverHealth,
  recoverMana,
  createOverviewField,
  createStatsField,
  createAreaField,
  createQuestField,
  updateClass,
};