const { MessageEmbed } = require("discord.js");
const { Op } = require('sequelize');

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
    monster.health -= hero.strength * 1.5;
    message.messageField += `Dealt ${hero.strength * 1.5} crit damage!\n`;
  } else {                                                      // didn't crit
    monster.health -= hero.strength;
    message.messageField += `Dealt ${hero.strength} damage\n`;
  }
}

async function simulateBeingHit(interaction, Hero, monster, message) {
  await Hero.increment(                                         // monster attacks
    { health: -monster.strength },
    { where: { userID: interaction.user.id } }
  );
  message.messageField += `Received ${monster.strength} damage\n`;
}

async function simulateVictory(interaction, Hero, monster, message) {
  await Hero.increment(                                         // update rewards
    { exp: +monster.exp, credits: +monster.credits },
    { where: {userID: interaction.user.id } }
  );
  message.messageField += `Defeated ${monster.name}!\n`;
  message.messageField += `Gained ${monster.exp} experience and received ${monster.credits} credits!\n`;
}

async function simulateDefeat(interaction, Hero, message) {
  await Hero.update(
    { health: 0, status: 'Recovering' }, 
    { where: { userID: interaction.user.id } }
  );
  message.messageField += 'Your hero has been defeated!\n';
}

async function simulateDrops(interaction, monster, message, sequelize, DataTypes) {
  const Items = require('../Models/items')(sequelize, DataTypes);
  const UserItems = require('../Models/userItems')(sequelize, DataTypes);
  const drops = await Items.findAll({                           // possible drops
    where: { name: { [Op.startsWith]: monster.drops } },
    raw: true,
  });
  await drops.forEach(item => {                                 // simulate drop chances
    const dropChance = Math.random() * (100 - 1) + 1;
    if (dropChance < item.drop_rate) {                          // item dropped
      UserItems.create({                                        // add to inv
        userID: interaction.user.id,
        itemID: item.itemID,
        type: item.type,
        name: item.name,
        attack: item.attack,
        amount: 1,
      });
      message.messageField += `${monster.name} dropped a ${item.name}!\n`;
    }
  })
}

module.exports = {
  checkStatus,
  createBattleEmbed,
  simulateAttack,
  simulateBeingHit,
  simulateVictory,
  simulateDefeat,
  simulateDrops,
}