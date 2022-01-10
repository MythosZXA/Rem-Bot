const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { Op } = require('sequelize');

async function checkLevelUp(interaction, Hero, message) {
  const hero = await Hero.findOne({
    where: { userID: interaction.user.id },
    raw: true,
  });
  const requiredEXP = 100 * Math.pow(1.05, hero.level)
  if (hero.exp >= requiredEXP) {
    await Hero.increment(
      { level: +1, exp: -requiredEXP, max_health: +5, strength: +1, defense: +1 },
      { where: { userID: interaction.user.id } },
    );
    message.messageField += 'Your hero leveled up!\n';
  }
}

async function checkStatus(interaction, Hero) {
  const { status } = await Hero.findOne({ 
      where: { userID: interaction.user.id },
      attributes: ['status'],
      raw: true,
    });
  if (status == 'Busy' && interaction.commandName == 'dungeon') {
    await interaction.reply({
      content: 'Your hero is currently busy with another task!',
      ephemeral: true,
    });
    return 2;
  } else if (status == 'Recovering' && interaction.commandName == 'dungeon') {
    await interaction.reply({
      content: 'Your hero is currently recovering from defeat!',
      ephemeral: true,
    });
    return 1;
  } else {
    return 0;
  }
}

function createBattleEmbed(hero, monster, currentStage) {
  return new MessageEmbed()
    .setColor('#FF0000')
    .setTitle(`Stage ${currentStage}`)
    .addField('Hero',
    `💟 ${hero.health}
    💠 ${hero.mana}`,
    true)
    .addField('🆚', '---\n---', true)
    .addField(monster.name,
      `💟 ${monster.health}`,
    true);
}

function createSkillActionRow(heroClass) {
  const skillRow = new MessageActionRow();
  const firstSkill = new MessageButton();
  switch (heroClass) {
    case 'Guardian':
      firstSkill.setCustomId('shieldBash').setLabel('Shield Bash').setStyle('SUCCESS');
      break;
    case 'Striker':
      firstSkill.setCustomId('tripleStrike').setLabel('Triple Strike').setStyle('SUCCESS');
      break;
    case 'Mystic':
      firstSkill.setCustomId('swordEnhance').setLabel('Sword Enhance').setStyle('SUCCESS');
      break;
    case 'Archer':
      firstSkill.setCustomId('sixfoldArrow').setLabel('Sixfold Arrow').setStyle('SUCCESS');
      break;
    case 'Oracle':
      firstSkill.setCustomId('explosiveBolt').setLabel('Explosive Bolt').setStyle('SUCCESS');
      break;
    case 'Sorcerer':
      firstSkill.setCustomId('fireBall').setLabel('Fire Ball').setStyle('SUCCESS');
      break;
    case 'Assassin':
      firstSkill.setCustomId('assassinate').setLabel('Assassinate').setStyle('SUCCESS');
      break;
    case 'Slayer':
      firstSkill.setCustomId('execute').setLabel('Execute').setStyle('SUCCESS');
      break;
    default:
      firstSkill.setCustomId('noSkill').setLabel('No Skill').setStyle('SECONDARY');
  }
  return skillRow.addComponents(firstSkill);
}

async function shieldBash(Hero, hero, monster, message) {
  if (hero.mana < 20) return false;
  // deals 80% damage and stuns for 2 turns
  const critChance = Math.random() * (100 - 1) + 1;               // hero attacks
  let skillDamage = hero.strength * .8;
  let finalDamage = skillDamage;
  if (critChance <= hero.crit_rate) {                             // crit
    finalDamage = (skillDamage +                                  // base damage
                  (skillDamage * hero.crit_damage / 100)) *       // add crit
                  (1 - (monster.defense / 1000));                 // subtract monster defense
    monster.health -= finalDamage;
    message.messageField += `Dealt ${finalDamage} crit damage!\n`;
  } else {                                                        // didn't crit
    finalDamage = skillDamage * (1 - (monster.defense / 1000));
    monster.health -= finalDamage;
    message.messageField += `Dealt ${finalDamage} damage\n`;
  }
  await Hero.increment(                                           // reduce mana
    { mana: -20 },
    { where: { userID: hero.userID } },
  );
  monster.disabled = 2;                                           // stun monster
  message.messageField += `Stunned ${monster.name} for 2 turns!\n`;
}

async function tripleStrike(Hero, hero, monster, message) {
  if (hero.mana < 40) return false;
  // deals 60% damage 3 times
  for (let i = 0; i < 3; i++) {
    let critChance = Math.random() * (100 - 1) + 1;               // hero attacks
    let skillDamage = hero.strength * .6;
    let finalDamage = skillDamage;
    if (critChance <= hero.crit_rate) {                           // crit
      finalDamage = (skillDamage +                                // base damage
                    (skillDamage * hero.crit_damage / 100)) *     // add crit
                    (1 - (monster.defense / 1000));               // subtract monster defense
      monster.health -= finalDamage;
      message.messageField += `Dealt ${finalDamage} crit damage!\n`;
    } else {                                                      // didn't crit
      finalDamage = skillDamage * (1 - (monster.defense / 1000));
      monster.health -= finalDamage;
      message.messageField += `Dealt ${finalDamage} damage\n`;
    }
  }
  await Hero.increment(                                           // reduce mana
    { mana: -40 },
    { where: { userID: hero.userID } },
  );
}

async function enhanceSword(Hero, hero, monster, message) {
  // if (hero.mana < 20) return false;
  // // deals 80% damage and stuns for 2 turns
  // const critChance = Math.random() * (100 - 1) + 1;             // hero attacks
  // let finalDamage = hero.strength;
  // if (critChance <= hero.crit_rate) {                           // crit
  //   finalDamage = (hero.strength * .8 * 1.5) * (1 - (monster.defense / 1000));
  //   monster.health -= finalDamage;
  //   message.messageField += `Dealt ${finalDamage} crit damage!\n`;
  // } else {                                                      // didn't crit
  //   finalDamage = (hero.strength * .8) * (1 - (monster.defense / 1000));
  //   monster.health -= finalDamage;
  //   message.messageField += `Dealt ${finalDamage} damage\n`;
  // }
  // await Hero.increment(                                         // reduce mana
  //   { mana: -20 },
  //   { where: { userID: hero.userID } },
  // );
}

async function sixfoldArrow(Hero, hero, monster, message) {
  if (hero.mana < 45) return false;
  // deals 45% damage six times
  for (let i = 0; i < 6; i++) {
    let critChance = Math.random() * (100 - 1) + 1;             // hero attacks
    let skillDamage = hero.strength * .45;
    let finalDamage = skillDamage;
    if (critChance <= hero.crit_rate) {                         // crit
      finalDamage = (skillDamage +                              // base damage
                    (skillDamage * hero.crit_damage / 100)) *   // add crit
                    (1 - (monster.defense / 1000));             // subtract monster defense
      monster.health -= finalDamage;
      message.messageField += `Dealt ${finalDamage} crit damage!\n`;
    } else {                                                    // didn't crit
      finalDamage = skillDamage * (1 - (monster.defense / 1000));
      monster.health -= finalDamage;
      message.messageField += `Dealt ${finalDamage} damage\n`;
    }
  }
  await Hero.increment(                                         // reduce mana
    { mana: -45 },
    { where: { userID: hero.userID } },
  );
}

async function explosiveBolt(Hero, hero, monster, message) {
  // if (hero.mana < 50) return false;
  // // deals crit damage and crit dmg is 4x if monster hp < 50%
  // let finalDamage = hero.strength;
  // if (monster.health < monster.max_health / 2) {
  //   finalDamage = (hero.strength * 4) * (1 - (monster.defense / 1000));
  // } else {
  //   finalDamage = (hero.strength * 1.5) * (1 - (monster.defense / 1000));
  // }
  // monster.health -= finalDamage;
  // message.messageField += `Dealt ${finalDamage} crit damage!\n`;
  // await Hero.increment(
  //   { mana: -50 },
  //   { where: { userID: hero.userID } },
  // );
}

async function assassinate(Hero, hero, monster, message) {
  if (hero.mana < 50) return false;
  // deals crit damage and base dmg is 2.5x if monster hp < 50%
  let finalDamage = hero.strength;
  if (monster.health < monster.max_health / 2) {
    finalDamage = (finalDamage * 2.5 +
                  (finalDamage * 2.5 * 1.5)) *
                  (1 - (monster.defense / 1000));
  } else {
    finalDamage = (finalDamage +
                  (finalDamage * hero.crit_rate)) *
                  (1 - (monster.defense / 1000));
  }
  monster.health -= finalDamage;
  message.messageField += `Dealt ${finalDamage} crit damage!\n`;
  await Hero.increment(
    { mana: -50 },
    { where: { userID: hero.userID } },
  );
}

async function execute(Hero, hero, monster, message) {
  if (hero.mana < 15) return false;
  // deals 130% damage at the cost of 5% hp
  const critChance = Math.random() * (100 - 1) + 1;               // hero attacks
  let finalDamage = hero.strength;
  if (critChance <= hero.crit_rate) {                             // crit
    finalDamage = (hero.strength * 1.5) * (1 - (monster.defense / 1000));
    monster.health -= finalDamage;
    message.messageField += `Dealt ${finalDamage} crit damage!\n`;
  } else {                                                        // didn't crit
    finalDamage = (hero.strength) * (1 - (monster.defense / 1000));
    monster.health -= finalDamage;
    message.messageField += `Dealt ${finalDamage} damage\n`;
  }
  await Hero.increment(                                           // reduce mana
    { mana: -15 },
    { where: { userID: hero.userID } },
  );
}

function simulateAttack(hero, monster, message) {
  const critChance = Math.random() * (100 - 1) + 1;             // hero attacks
  let finalDamage = hero.strength;
  if (critChance <= hero.crit_rate) {                           // crit
    finalDamage = (hero.strength * 1.5) * (1 - (monster.defense / 1000));
    monster.health -= finalDamage;
    message.messageField += `Dealt ${finalDamage} crit damage!\n`;
  } else {                                                      // didn't crit
    finalDamage = hero.strength * (1 - (monster.defense / 1000));
    monster.health -= finalDamage;
    message.messageField += `Dealt ${finalDamage} damage\n`;
  }
}

async function simulateBeingHit(interaction, Hero, hero, monster, message) {
  const finalDamage = monster.strength * (1 - (hero.defense / 1000));
  await Hero.increment(                                         // monster attacks
    { health: -finalDamage},
    { where: { userID: interaction.user.id } }
  );
  message.messageField += `Received ${finalDamage} damage\n`;
}

async function simulateVictory(interaction, Hero, monster, message) {
  await Hero.increment(                                         // update rewards
    { exp: +monster.exp, credits: +monster.credits },
    { where: {userID: interaction.user.id } }
  );
  message.messageField += `Defeated ${monster.name}!\n`;
  message.messageField += `Gained ${monster.exp} experience and received ${monster.credits} credits!\n`;
  await checkLevelUp(interaction, Hero, message);
}

async function simulateDefeat(interaction, Hero, message) {
  await Hero.update(
    { health: 0, status: 'Recovering' }, 
    { where: { userID: interaction.user.id } }
  );
  message.messageField += 'Your hero has been defeated!\n';
}

async function simulateDrops(interaction, monster, message, sequelize, DataTypes) {
  // require models to simulate monster drops
  const Items = require('../Models/items')(sequelize, DataTypes);
  const Inventory = require('../Models/inventory')(sequelize, DataTypes);
  // check normal drops
  const drops = await Items.findAll({                                // possible drops
    where: { name: { [Op.startsWith]: monster.drops } },
    raw: true,
  });
  await drops.forEach(async item => {                                // simulate drop chances
    const dropChance = Math.random() * (100 - 1) + 1;
    if (dropChance < item.drop_rate) {                               // item dropped
      if (item.type == 'Material') {                                 // material type, update in inv
        const [wantedItem, created] = await Inventory.findOrCreate({ // create if not found
          where: { name: item.name },
          defaults: { 
            userID: interaction.user.id,
            itemID: item.itemID,
            type: item.type,
            name: item.name,
            amount: 1,
          },
        });
        if (!created) {
          await Inventory.increment(                                 // update if found
            { amount: +1 },
            { where: { userID: interaction.user.id, name: item.name } },
          );
        }
      } else {
        await Inventory.create({                                     // equip type, create in inv
          userID: interaction.user.id,
          itemID: item.itemID,
          type: item.type,
          name: item.name,
          attack: item.attack,
          amount: 1,
        });
      }
      message.messageField += `${monster.name} dropped a ${item.name}!\n`;
    }
  });
  // check collection drops
  const { itemID : collectionID } = await Items.findOne({ where: { name: monster.collection}});
  const [wantedItem, created] = await Inventory.findOrCreate({       // create if not found
    where: { 
      userID: interaction.user.id,
      itemID: collectionID
    },
    defaults: {
      userID: interaction.user.id,
      itemID: collectionID,
      type: 'Collection',
      name: monster.collection,
    },
  });
  if (!created) {
    await Inventory.increment(                                       // update if found
      { amount: +1 },
      { where: { userID: interaction.user.id, name: monster.collection } },
    );
  }
  message.messageField += `${monster.name} dropped a ${monster.collection}\n`;
}

module.exports = {
  checkLevelUp,
  checkStatus,
  createBattleEmbed,
  createSkillActionRow,
  shieldBash,
  tripleStrike,
  enhanceSword,
  sixfoldArrow,
  explosiveBolt,
  assassinate,
  execute,
  simulateAttack,
  simulateBeingHit,
  simulateVictory,
  simulateDefeat,
  simulateDrops,
};