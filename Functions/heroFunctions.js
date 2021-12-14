const { Op } = require('sequelize');

async function recoverHealth(sequelize, DataTypes) {
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  setInterval(() => {
    Hero.increment(
      { health: +1 },
      { where: { health: { [Op.lt]: sequelize.col('max_health') } } },
    );
    Hero.update(
      { status: 'Good' },
      { where: { status: 'Recovering', health: { [Op.eq]: sequelize.col('max_health') } } }
    );
  }, 1000);
}

async function recoverMana(sequelize, DataTypes) {
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  setInterval(() => {
    Hero.increment(
      { mana: +1 },
      { where: { mana: { [Op.lt]: sequelize.col('max_mana') } } },
    );
  }, 1000 * 3);
}

async function updateClass(interaction, Hero, Equip) {
  const { name : primaryWeapon } = await Equip.findOne({             // get primary weapon
    where: {
      userID: interaction.user.id,
      type: 'Primary',
    },
    raw: true,
  });
  const { name : secondaryWeapon } = await Equip.findOne({           // get secondary weapon
    where: {
      userID: interaction.user.id,
      type: 'Secondary',
    },
    raw: true,
  });
  // determine which class to change to
  let changeTo = 'Adventurer';
  if (primaryWeapon.includes('Sword')) {                             // sword primary
    if (secondaryWeapon.includes('Shield')) {                        // shield secondary
      changeTo = 'Guardian';
    } else if (secondaryWeapon.includes('Sword')) {                  // sword secodnary
      changeTo = 'Striker';
    } else if (secondaryWeapon.includes('Arcane')) {                 // arcane secodnary
      changeTo = 'Mystic';
    }
  } else if (primaryWeapon.includes('Bow')) {                        // bow primary
    if (secondaryWeapon.includes('Arrows')) {                        // arrow secondary
      changeTo = 'Archer';
    } else if (secondaryWeapon.includes('Arcane')) {                 // arcane secodnary
      changeTo = 'Oracle';
    }
  } else if (primaryWeapon.includes('Staff')) {                      // staff primary
    if (secondaryWeapon.includes('Arcane')) {                        // arcane secondary
      changeTo = 'Sorcerer';
    }
  } else if (primaryWeapon.includes('Dagger')) {                     // dagger primary
    if (secondaryWeapon.includes('Dagger')) {                        // dagger secondary
      changeTo = 'Assassin';
    }
  } else if (primaryWeapon.includes('Greatsword')) {                 // greatsword primary
    if (secondaryWeapon.includes('Imprint')) {                       // imprint secondary
      changeTo = 'Slayer';
    }
  }
  // change class
  await Hero.update(
    { class: changeTo },
    { where: { userID: interaction.user.id } },
  );
}

module.exports= {
  recoverHealth,
  recoverMana,
  updateClass,
}