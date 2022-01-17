const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

const rockButton = new MessageButton()
  .setCustomId('rock')
  .setLabel('Rock')
  .setStyle('PRIMARY');
const paperButton = new MessageButton()
  .setCustomId('paper')
  .setLabel('Paper')
  .setStyle('PRIMARY');
const scissorsButton = new MessageButton()
  .setCustomId('scissors')
  .setLabel('Scissors')
  .setStyle('PRIMARY');
const declineButton = new MessageButton()
  .setCustomId('decline')
  .setLabel('Decline')
  .setStyle('DANGER');
const rpsChoices = new MessageActionRow()
  .setComponents([rockButton, paperButton, scissorsButton, declineButton]);

async function execute(interaction, sequelize, DataTypes) {
  // validate bet value
  const betAmount = interaction.options.getInteger('coins', true);
  if (betAmount < 0) {
    const remdisappointed = interaction.client.emojis.cache.find(emoji => emoji.name === 'remdisappointed');
    await interaction.reply({
      content: `No betting negative values ${remdisappointed}`,
      ephemeral: true,
    });
    return;
  }
  // find guild member by nickname
  const opponentNickname = interaction.options.getString('nickname', true);
  const opponentMember = (await (await interaction.client.guilds.fetch('773660297696772096')).members.fetch())
    .find(guildMember => guildMember.nickname?.toUpperCase() === opponentNickname.toUpperCase());
  if (!opponentMember) {                                      // no opponent, exit
    await interaction.reply({
      content: 'I could not find anyone with that nickname!',
      ephemeral: true,
    });
    return;
  }
  // check to see if both parties has enough coins
  const Users = require('../Models/users')(sequelize, DataTypes);
  const { Op } = require('sequelize');
  const gameMembers = await Users.findAll({
    where: { userID: { [Op.or]: [interaction.member.id, opponentMember.id] } },
    raw: true,
  });
  let enoughCoins = true;
  gameMembers.forEach(async member => {
    if (member.coins < interaction.options.getInteger('coins', true)) {
      enoughCoins = false;
    }
  })
  if (!enoughCoins) {                                         // not enough coins, exit
    await interaction.reply({
      content: 'Either you or your opponent does not have enough coins!',
      ephemeral: true,
    });
    return;
  }
  // initiate game
  await interaction.reply({      
    content: `${opponentMember}, ${interaction.member.nickname} \n` +
    `wants to play rock-paper-scissors with a bet of ${betAmount} coins!`,
    components: [rpsChoices],
  });
  // attach related information to message
  const gameMessage = await interaction.fetchReply();
  gameMessage.originalMember = interaction.member;
  gameMessage.opponentNickname = opponentNickname;
  gameMessage.requesterChoice = interaction.options.getString('choice', true);
  gameMessage.betAmount = betAmount;
  // update message if opponent didn't play in 10 mins
  setTimeout(async () => {
    await cancelGame(gameMessage);
  }, 1000 * 60 * 10);
}

async function play(interaction, sequelize, DataTypes) {
  // determine winner
  const gameMessage = interaction.message;
  let requesterChoice = gameMessage.requesterChoice.toUpperCase();
  let opponentChoice = interaction.customId.toUpperCase();
  let winner;
  if (requesterChoice == opponentChoice) {                                        // tie
    winner = undefined;
  } else if ((requesterChoice === 'ROCK' && opponentChoice === 'SCISSORS') ||
             (requesterChoice === 'PAPER' && opponentChoice === 'ROCK') ||
             (requesterChoice === 'SCISSORS' && opponentChoice === 'PAPER')) {    // requester wins
    winner = gameMessage.originalMember;
  } else {                                                                        // opponent wins
    winner = interaction.member;
  }
  // switch choices to emojis for display
  switch (requesterChoice) {
    case 'ROCK':
      requesterChoice = '✊';
      break;
    case 'PAPER':
      requesterChoice = '✋';
      break;
    case 'SCISSORS':
      requesterChoice = '✌️';
      break;
  }
  switch (opponentChoice) {
    case 'ROCK':
      opponentChoice = '✊';
      break;
    case 'PAPER':
      opponentChoice = '✋';
      break;
    case 'SCISSORS':
      opponentChoice = '✌️';
      break;
  }
  // create result display with embed
  const displayEmbed = new MessageEmbed().setColor('GREEN');
  if (winner) {
    displayEmbed.setTitle(`${winner.nickname} wins!`);
  } else {
    displayEmbed.setTitle('It\'s a tie!')
  }
  displayEmbed
    .addField(`${gameMessage.originalMember.nickname}`,
              `${requesterChoice}`,
              true)
    .addField('🆚', '---', true)
    .addField(`${interaction.member.nickname}`,
              `${opponentChoice}`,
              true);
  // update game message to display result
  await interaction.update({
    content: 'Results:',
    embeds: [displayEmbed],
    components: [],
  });
  // update data
  const Users = require('../Models/users')(sequelize, DataTypes);
  if (winner) {
    // increase winner stats
    const betAmount = gameMessage.betAmount;
    await Users.increment(
      { rpsWins: +1 , coins: sequelize.literal(+betAmount) },
      { where: { userID: winner.id } },
    );
    // decrease loser stats
    if (winner == gameMessage.originalMember) {                                   // requester won
      await Users.increment(
        { coins: sequelize.literal(-betAmount) },
        { where: { userID: interaction.user.id } },
      );
    } else {                                                                      // requester lost
      await Users.increment(
        { coins: sequelize.literal(-betAmount) },
        { where: { userID: gameMessage.originalMember.id } },
      );
    }
    // update leaderboard
    const leaderboardFunctions = require('../Functions/leaderboardFunctions');
    await leaderboardFunctions.updateRPSLeaderboard(interaction.client, sequelize, DataTypes);
  }
}

async function cancelGame(gameMessage) {
  if (!gameMessage.content.includes('Results')) {
    await gameMessage.edit({
      content: `${gameMessage.opponentNickname} didn't want to play :(`,
      components: [],
    });
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play a game of rock-paper-scissors with someone')
    .addStringOption(option =>
      option.setName('nickname')
      .setDescription('The nickname of the person you want to play with')
      .setRequired(true))
    .addStringOption(option =>
      option.setName('choice')
      .setDescription('Rock, paper, or scissors')
      .setRequired(true)
      .addChoice('Rock', 'Rock')
      .addChoice('Paper', 'Paper')
      .addChoice('Scissors', 'Scissors'))
    .addIntegerOption(option =>
      option.setName('coins')
      .setDescription('How much coins do you want to bet')
      .setRequired(true)),
  execute,
  play,
  cancelGame,
};