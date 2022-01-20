const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { message } = require("../prefixCommands");

let gameMessage;
const gameEmbed = new MessageEmbed()
  .setColor(0x19EFF5)
  .setImage('https://i.imgur.com/SdNtESm.jpg');

async function execute(interaction, sequelize, DataTypes) {
  // check if this is the bet subcommand
  const subcommandName = interaction.options._subcommand;
  if (subcommandName === 'bet') {
    await bet(interaction);
    return;
  }
  // check if there is an active routlette game
  if (gameMessage) {
    await interaction.reply({
      content: 'There is already an active Roulette game!',
      ephemeral: true,
    });
    return;
  }
  // initiate game by sending game message
  gameEmbed
    .setDescription(
      `${interaction.member.nickname} would like to play a game of Roulette!
      Place your bets if you would to play.
      I will roll in 30 seconds.`)
    .addField('Players', 'None');
  await interaction.reply({
    content: 'ping',
    embeds: [gameEmbed],
  });
  // attach roulette related data to the message
  gameMessage = await interaction.fetchReply();
  gameMessage.originalMember = interaction.member;
  gameMessage.players = '';
  gameMessage.playerBets = [];
  // proceed with game after 30 seconds
  setTimeout(async () => {
    if (gameEmbed.fields[0].value === 'None') {
      await gameMessage.edit({
        content: 'No players',
        embeds: [],
      });
      return;
    }
    await roll(interaction, sequelize, DataTypes);
  }, 1000 * 30);
  
}

async function bet(interaction) {
  // check if there is an active routlette game
  if (!gameMessage) {
    await interaction.reply({
      content: 'There isn\'t an active Roulette game',
      ephemeral: true,
    });
    return;
  }
  // validate bet value
  const betAmount = interaction.options._hoistedOptions[0].value;
  if (betAmount < 0) {
    const remdisappointed = interaction.client.emojis.cache.find(emoji => emoji.name === 'remdisappointed');
    await interaction.reply({
      content: `No betting negative values ${remdisappointed}`,
      ephemeral: true,
    });
    return;
  }
  // check if the player has already made an outside bet
  const interactionMember = interaction.member;
  if (gameMessage.playerBets.find(playerBet => 
    (playerBet.member === interactionMember && playerBet.outside === true))) {
    await interaction.reply({
      content: 'You have already made an outside bet!',
      ephemeral: true,
    });
    return;
  }
  // add player bets to game message
  const betType = interaction.options._hoistedOptions[1].value;
  let playerBet;
  if (betType === 'Straight Up') {
    // check if a value was provided for a straight up bet
    if (!interaction.options._hoistedOptions[2]) {
      await interaction.reply({
        content: 'You did not enter a value for a straight up bet',
        ephemeral: true,
      });
      return;
    }
    // check if straight up bet value is valid
    const straightUpValue = interaction.options._hoistedOptions[2].value;
    const straightUpValueInt = parseInt(straightUpValue);
    if ((straightUpValueInt < 0 || straightUpValueInt > 36) && straightUpValue !== '00') {
      await interaction.reply({
        content: 'Invalid straight up value',
        ephemeral: true,
      });
      return;
    }
    playerBet = {
      member: interactionMember,
      bet: straightUpValue,
      betAmount: betAmount,
      outside: false,
    };
  } else {                                                // outside bets
    playerBet = {
      member: interactionMember,
      bet: betType,
      betAmount: betAmount,
      outside: true,
    };
  }
  gameMessage.playerBets.push(playerBet);
  // update players in game message
  if (!gameMessage.players.includes(interactionMember.nickname)) {
    gameMessage.players += `${interactionMember.nickname}\n`;
  }
  gameEmbed.setFields([{ name: 'Players', value: gameMessage.players }]);
  await gameMessage.edit({ embeds: [gameEmbed] });
  // send confirmation message
  await interaction.reply({
    content: 'Bet placed!',
    ephemeral : true,
  });
}

async function roll(interaction, sequelize, DataTypes) {
  // required models for this game
  const Users = require('../Models/users')(sequelize, DataTypes);
  const roll = Math.floor(Math.random() * 38);
  const reds = [
    1, 3, 5, 7, 9, 12,
    14, 16, 18, 19, 21, 23,
    25, 27, 30, 32, 34, 36
  ];
  const blacks = [
    2, 4, 6, 8, 10, 11,
    13, 15, 17, 20, 22, 24,
    26, 28, 29, 31, 33, 35
  ];
  // check each bets to see if it won
  let resultsField = '';
  gameMessage.playerBets.forEach(async playerBet => {
    let resultCoin = playerBet.betAmount;
    let win = false;
    switch(playerBet.bet) {
      case '1-18':
        if (roll >= 1 && roll <= 18) win = true;
        break;
      case 'Even':
        if (roll % 2 == 0) win = true;
        break;
      case 'Red':
        if (reds.find(number => number === roll)) win = true;
        break;
      case 'Black':
        if (blacks.find(number => number === roll)) win = true;
        break;
      case 'Odd':
        if ((roll % 2 == 1) && roll != 37) win = true;
        break;
      case '19-36':
        if (roll >= 19 && roll <= 36) win = true;
        break;
      case 'Green':
        if (roll === 0 || roll === 37) {
          win = true;
          resultCoin *= 17;
        }
        break;
      case 'Straight Up':
        if (roll === 37 && playerBet.bet === '00') {
          win = true;
          resultCoin *= 35;
          break;
        }
        if (roll.toString() === playerBet.bet) {
          win = true;
          resultCoin *= 35;
        }
    }
    if (win) {
      resultsField += `${playerBet.member.nickname} won ${resultCoin} coins with a ${playerBet.bet} bet!\n`;
      await Users.increment(
        { coins: sequelize.literal(+resultCoin) },
        { where: { userID: playerBet.member.id } }
      );
    } else {
      resultsField += `${playerBet.member.nickname} lost ${resultCoin} coins with a ${playerBet.bet} bet\n`;
      await Users.increment(
        { coins : sequelize.literal(-resultCoin) },
        { where: { userID: playerBet.member.id } }
      );
    }
  });
  if (roll === 37) roll = '00'
  gameEmbed.setDescription(`The roll is... **${roll}**!!!`)
  gameEmbed.setFields([{ name: 'Results', value: resultsField }]);
  gameEmbed.setImage('');
  await gameMessage.edit({ embeds: [gameEmbed] });
  await require('../Functions/leaderboardFunctions').updateRPSLeaderboard(interaction.client, sequelize, DataTypes);
  gameMessage = undefined;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roulette')
    .setDescription('Play a game of Roulette')
    .addSubcommand(subcommand =>
      subcommand.setName('play')
      .setDescription('Start a game of Roulette'))
    .addSubcommand(subcommand =>
      subcommand.setName('bet')
      .setDescription('Set a bet for Roulette')
      .addIntegerOption(option =>
        option.setName('coins')
        .setDescription('How much coins do you want to bet')
        .setRequired(true))
      .addStringOption(option =>
        option.setName('bet_type')
        .setDescription('The type of bet you are placing')
        .setRequired(true)
        .addChoice('1-18', '1-18')
        .addChoice('Even', 'Even')
        .addChoice('Red', 'Red')
        .addChoice('Black', 'Black')
        .addChoice('Odd', 'Odd')
        .addChoice('19-36', '19-36')
        .addChoice('Green', 'Green')
        .addChoice('Straight Up', 'Straight Up'))
      .addStringOption(option =>
        option.setName('straight_up_value')
        .setDescription('Enter the number you want to bet straight up, otherwise omit'))),
  execute,
  bet,
  roll,
};