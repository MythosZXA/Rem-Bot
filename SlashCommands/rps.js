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
const rpsChoices = new MessageActionRow()
  .setComponents([rockButton, paperButton, scissorsButton]);

async function execute(interaction) {
  // find guild member by nickname
  const opponentNickname = interaction.options.getString('nickname', true);
  const opponent = (await (await interaction.client.guilds.fetch('773660297696772096')).members.fetch())
    .find(guildMember => guildMember.nickname?.toLowerCase() == opponentNickname.toLowerCase());
  // initiate the game if opponent is found
  if (!opponent) {                                          // no opponent
    await interaction.reply({
      content: 'I could not find anyone with that nickname!',
      ephemeral: true,
    });
    return;
  } else {                                                  // opponent found
    await interaction.reply({      
      content: `${opponent}, ${interaction.member.nickname} wants to play rock-paper-scissors!`,
      components: [rpsChoices],
    });
    // attach related information to message
    const gameMessage = await interaction.fetchReply();
    gameMessage.originalMember = interaction.member;
    gameMessage.opponent = opponentNickname;
    gameMessage.choice = interaction.options.getString('choice', true);
    // update message if opponent didn't play
    setTimeout(async () => {
      if (!gameMessage.content.includes('Results')) {
        await gameMessage.edit({
          content: `${gameMessage.opponent} didn't want to play :(`,
          components: [],
        });
      }
    }, 1000 * 60 * 10);
  }
}

async function play(interaction, sequelize, DataTypes) {
  // determine winner
  let requesterChoice = interaction.message.choice.toLowerCase();
  let opponentChoice = interaction.customId;
  let winner;
  if (requesterChoice == opponentChoice) {                                        // tie
    winner = undefined;
  } else if ((requesterChoice == 'rock' && opponentChoice == 'scissors') ||
             (requesterChoice == 'paper' && opponentChoice == 'rock') ||
             (requesterChoice == 'scissors' && opponentChoice == 'paper')) {      // requester wins
    winner = interaction.message.originalMember;
  } else {                                                                        // opponent wins
    winner = interaction.member;
  }
  // switch choices to emojis for display
  switch (interaction.message.choice) {
    case 'Rock':
      requesterChoice = '✊';
      break;
    case 'Paper':
      requesterChoice = '✋';
      break;
    case 'Scissors':
      requesterChoice = '✌️';
      break;
  }
  switch (interaction.customId) {
    case 'rock':
      opponentChoice = '✊';
      break;
    case 'paper':
      opponentChoice = '✋';
      break;
    case 'scissors':
      opponentChoice = '✌️';
      break;
  }
  // create result display with embed
  const displayEmbed = new MessageEmbed().setColor('GREEN');
  if (winner) {
    displayEmbed.setTitle(`${winner.nickname} wins!`);
  } else {
    displayEmbed.setTitle('It is a tie!')
  }
  displayEmbed
    .addField(`${interaction.message.originalMember.nickname}`,
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
  // update data & leaderboard
  const Users = require('../Models/users')(sequelize, DataTypes);
  if (winner) {
    await Users.increment(
      { rpsWins: +1 },
      { where: { userID: winner.id } },
    );
    const leaderboardFunctions = require('../Functions/leaderboardFunctions');
    await leaderboardFunctions.updateRPSLeaderboard(interaction.client, sequelize, DataTypes);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rock_paper_scissors')
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
      .addChoice('Scissors', 'Scissors')),
  execute,
  play,
};