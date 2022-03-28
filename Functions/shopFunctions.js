const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { Users } = require('../sequelize');
const leaderboardFunctions = require('../Functions/leaderboardFunctions');

const farmEmbed = new MessageEmbed()
  .setColor('GREEN')
  .setThumbnail('https://i.imgur.com/bZuenoY.png')
  .setTitle('Banana Farm')
  .setDescription('Increases your check in value')
  .addFields(
    { name: 'Base Farm', value: '**5000 Coins**\nIncreases check in value by 200'},
    { name: 'Upgrades (Limit 5)', value: '**2500 Coins**\nIncreases check in value by 50'},
  );

async function upgrade(interaction) {
  // check if member can upgrade farm
  const userID = interaction.user.id;
  const guildUser = await Users.findOne({ where: { userID: userID }, raw: true });
  if (guildUser.farmLv === null) {                               // doesn't have farm, exit
    interaction.reply({
      content: 'You cannot upgrade if you do not have a farm!',
      ephemeral: true,
    });
    return;
  } else if (guildUser.farmLv === 5) {                           // max level, exit
    interaction.reply({
      content: 'Your farm is already max level!',
      ephemeral: true,
    });
    return;
  } else if (guildUser.coins < 2500) {                           // not enough coins, exit
    interaction.reply({
      content: 'You do not have enough coins!',
      ephemeral: true,
    });
    return;
  }
  // deduct coins & upgrade farm level
  await Users.increment(
    { coins: -2500, farmLv: +1 },
    { where: { userID: userID } },
  );
  // send confirmation message
  interaction.reply({
    content: `You have upgraded your farm to level ${++guildUser.farmLv}!`,
    ephemeral: true,
  });
  // update leaderboard
  leaderboardFunctions.updateGamblingLeaderboard(interaction.client);
}

async function buy(interaction) {
  // check if member can buy farm
  const userID = interaction.user.id;
  const guildUser = await Users.findOne({ where: { userID: userID }, raw: true });
  if (guildUser.farmLv !== null) {                               // already has farm, exit
    interaction.reply({
      content: 'You already have a farm!',
      ephemeral: true,
    });
    return;
  } else if (guildUser.coins < 5000) {                           // not enough coins, exit
    interaction.reply({
      content: 'You do not have enough coins!',
      ephemeral: true,
    });
    return;
  }
  // deduct coins
  await Users.increment(
    { coins: -5000 },
    { where: { userID: userID } },
  );
  // update farm level
  Users.update(
    { farmLv: 0 },
    { where: { userID: userID } },
  );
  // send confirmation message
  interaction.reply({
    content: 'You have bought a farm!',
    ephemeral: true,
  });
  // update leaderboard
  leaderboardFunctions.updateGamblingLeaderboard(interaction.client);
}

async function update(rem) {
  const farmChannel = await rem.channels.fetch('940816082858553415');
  const farmMessage = await farmChannel.messages.fetch('940992074315071529');
  farmMessage.buttonType = 'shop';
  farmMessage.edit({ embeds: [farmEmbed] });
}

module.exports = {
  upgrade,
  buy,
  update,
};