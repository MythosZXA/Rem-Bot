const { Op } = require('sequelize');

async function recoverHealth(sequelize, DataTypes) {
  const Heroes = require('../Models/heroes')(sequelize, DataTypes);
  setInterval(() => {
    Heroes.increment(
      { health: +1 },
      { where: { health: { [Op.lt]: sequelize.col('max_health') } } },
    );
    Heroes.update(
      { status: 'Good' },
      { where: { status: 'Recovering', health: { [Op.eq]: sequelize.col('max_health') } } }
    );
  }, 1000 * 5);
}

async function recoverMana(sequelize, DataTypes) {
  const Heroes = require('../Models/heroes')(sequelize, DataTypes);
  setInterval(() => {
    Heroes.increment(
      { mana: +1 },
      { where: { mana: { [Op.lt]: sequelize.col('max_mana') } } },
    );
  }, 1000 * 3);
}

async function getArea(area) {
  // get the area the hero is in & create area display field
  let areaField = '';
  if (area[0].type === 'Field') {             // field type area, add monsters
    area.forEach(area => areaField += `${area.monster}\n`);
  }
  if (areaField === '') areaField = 'None';
  return areaField;
}

async function getQuests(userID, location, sequelize, DataTypes) {
  // required models for this function
  const Quests = require('../Models/quests')(sequelize, DataTypes);
  const CompletedQuests = require('../Models/completed_quests')(sequelize, DataTypes);
  // get available quest in this location
  const availableQuests = (await Quests.findAll({
    attributes: ['name'],
    where: { location: location },
    raw: true,
  })).map(model => model.name);
  // get quests completed by hero in this location
  const finishedQuests = (await CompletedQuests.findAll({
    attributes: ['name'],
    where: { userID: userID, location: location},
    raw: true,
  })).map(model => model.name);
  // create a field to display uncompleted quests
  let questField = '';
  availableQuests.forEach(availableQuest => {                 // add uncompleted quests to display string
    if (!finishedQuests.find(finishedQuest => finishedQuest === availableQuest)) {
      questField += `${availableQuest}\n`;
    }
  });
  if (questField === '') questField = 'None';               // no quest available
  return questField;
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
  getArea,
  getQuests,
  updateClass,
};