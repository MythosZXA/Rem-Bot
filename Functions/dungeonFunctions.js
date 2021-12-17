const { MessageEmbed } = require("discord.js");
const { Op } = require('sequelize');
const hero = require("../Models/hero");

async function checkLevelUp(interaction, Hero, message) {
  const hero = await Hero.findOne({
    where: { userID: interaction.user.id },
    raw: true,
  });
  const requiredEXP = 100 * Math.pow(1.1, hero.level)
  if (hero.exp >= requiredEXP) {
    await Hero.increment(
      { level: +1, exp: -requiredEXP, max_health: +30, strength: +10, defense: +5 },
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

async function simulateAttack(hero, monster, message) {
  const critChance = Math.random() * (100 - 1) + 1;             // hero attacks
  if (critChance <= hero.crit_rate) {                           // crit
    const finalDamage = (hero.strength * 1.5) * (1 - (monster.defense / 1000));
    monster.health -= finalDamage;
    message.messageField += `Dealt ${finalDamage} crit damage!\n`;
  } else {                                                      // didn't crit
    const finalDamage = hero.strength * (1 - (monster.defense / 1000));
    monster.health -= hero.strength - monster.defense;
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
  simulateAttack,
  simulateBeingHit,
  simulateVictory,
  simulateDefeat,
  simulateDrops,
}