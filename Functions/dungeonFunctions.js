const { MessageEmbed } = require("discord.js");

async function checkBusy(Hero, interaction) {
  let busy = 0;
  await Hero.findOne({ 
      where: { userID: interaction.user.id },
      attributes: ['busy'],
      raw: true,
    })
    .then(busyMap => busy = busyMap.busy);
  if (busy == 1 && interaction.commandName == 'dungeons') {
    await interaction.reply({
      content: 'Your hero is currently busy with another task!',
      ephemeral: true,
    });
    return true;
  } else {
    return false;
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
  checkBusy,
  createBattleEmbed
}