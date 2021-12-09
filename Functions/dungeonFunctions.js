const { MessageEmbed } = require("discord.js");

async function checkStatus(Hero, interaction) {
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

module.exports = {
  checkStatus,
  createBattleEmbed
}