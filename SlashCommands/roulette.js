const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { Users } = require('../sequelize');
const leaderboardFunctions = require('../Functions/leaderboardFunctions');

const rouletteInfoEmbed = new MessageEmbed()
  .setColor(0x19EFF5)
  .setTitle('How to play Roulette')
  .setDescription(
    `**You are trying to guess the number that is going to be rolled**
    There are 38 numbers: **1-36**, **0**, and **00**
    You have multiple ways to place a bet:
    **Outside** bets pay is varied by the bet you make 
    => **1 to 1** bets covers a little less than half of the board
    ===> **1-18** | **Even** | **Red** | **Black** | **Odd** | **19-36**
    => **2 to 1** bets covers a little less than 1/3 of the board
    ===> **1st 12** | **2nd 12** | **3rd 12** | **1st Col** | **2nd Col** | **3rd Col**
    **Inside** bets pay is varied by the bet you make
    => **Line** bets pay **5:1**, covering 2 rows (10-15)
    => **Corner** bets pay **8:1**, covering 4 adj numbers (23,24,26,27)
    => **Street** bets pay **11:1**, covering 1 row (4,5,6)
    => **Split** bets pay **17:1**, covering 2 adj numbers (10,13 or 10,11)
    => **Straight Up** bets pay **35:1**, covering 1 number`)
  .setImage('https://i.imgur.com/SdNtESm.jpg');
const outsideBets = [
  '1-18', 'Even', 'Red', 'Black', 'Odd', '19-36',
  '1st 12', '2nd 12', '3rd 12', '1st Col', '2nd Col', '3rd Col',
];
const insideBets = [
  'Line', 'Corner', 'Street', 'Split', 'Straight Up'
];
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
let rouletteMessage, playerBets = [], playerNicknames = '';

async function execute(interaction) {
  // get info to check if user can make a bet
  const interactionMember = interaction.member;
  const remjudge = interaction.client.emojis.cache.find(emoji => emoji.name === 'remjudge');
  const guildUser = await Users.findOne({ where: { userID: interaction.member.id }, raw: true });
  const betAmount = interaction.options._hoistedOptions[0].value;
  const betType = interaction.options._hoistedOptions[1].value;
  const isOutsideBet = outsideBets.find(bet => bet === betType);
  let betTotal = betAmount;
  await new Promise(resolve => {
    if (playerBets.length === 0) resolve();
    playerBets.forEach((playerBet, index) => {
      betTotal += playerBet.betAmount;
      if (index === playerBets.length - 1) resolve();
    });
  });
  // check if user can make bet
  if (guildUser.coins < 0) {                                      // in debt, exit
    interaction.reply({
      content: `You are in debt ${remjudge}`,
      ephemeral: true,
    });
    return;
  } else if (guildUser.coins < betAmount) {                       // insufficient coins, exit
    interaction.reply({
      content: `You do not have that much coins!`,
      ephemeral: true,
    });
    return;
  } else if (betAmount < 0) {                                     // negative bet, exit
    interaction.reply({
      content: `No betting negative values ${remjudge}`,
      ephemeral: true,
    });
    return;
  } else if (betTotal > guildUser.coins) {                        // out of betting power, exit
    interaction.reply({
      content: 'You have used up all your betting power!',
      ephemeral: true,
    });
    return;
  } else if (playerBets.find(playerBet =>                         // multiple outside bets, exit
  (isOutsideBet && playerBet.member === interactionMember && playerBet.outside))) {
    interaction.reply({
      content: 'You have already made an outside bet!',
      ephemeral: true,
    });
    return;
  }
  // validate & add player bets to roulette message
  const isInsideBet = insideBets.find(bet => bet === betType);
  let playerBet;
  if (isInsideBet) {                                              // inside bet
    const insideBetString = interaction.options._hoistedOptions[2]?.value;
    if (!insideBetString) {                                       // no inside bet, exit
      interaction.reply({
        content: 'You did not enter a value for an inside bet',
        ephemeral: true,
      });
      return;
    }
    // check if inside bet values are valid
    let regex;
    switch (betType) {
      case 'Line':
        regex = new RegExp('^[0-9]{1,2},[0-9]{1,2},[0-9]{1,2},[0-9]{1,2},[0-9]{1,2},[0-9]{1,2}$')
        break;
      case 'Corner':
        regex = new RegExp('^[0-9]{1,2},[0-9]{1,2},[0-9]{1,2},[0-9]{1,2}$')
        break;
      case 'Street':
        regex = new RegExp('^[0-9]{1,2},[0-9]{1,2},[0-9]{1,2}$')
        break;
      case 'Split':
        regex = new RegExp('^[0-9]{1,2},[0-9]{1,2}$')
        break;
      case 'Straight Up':
        regex = new RegExp('^[0-9]{1,2}$')
        break;
    }
    let validBet;
    !regex.test(insideBetString) ? validBet = false : validBet = true;
    if (!validBet) {                                              // invalid inside bet, exit
      interaction.reply({
        content: 'You entered an invalid inside bet value',
        ephemeral: true,
      });
      return;
    }
    // save bet
    playerBet = {
      member: interactionMember,
      bet: insideBetString,
      betAmount: betAmount,
      outside: false,
    };
  } else if (isOutsideBet) {                                      // outside bet
    //save bet
    playerBet = {
      member: interactionMember,
      bet: betType,
      betAmount: betAmount,
      outside: true,
    };
  }
  // update display embed
  const rouletteEmbed = rouletteMessage.embeds[1];
  playerBets.push(playerBet);                                     // add bet to message
  if (!playerNicknames.includes(interactionMember.nickname)) {
    playerNicknames += `${interactionMember.nickname}\n`;         // add player to message if first bet
  }
  rouletteEmbed.fields[2].value = playerNicknames;
  rouletteMessage.edit({ embeds: [rouletteInfoEmbed, rouletteEmbed] });
  // send confirmation message
  interaction.reply({
    content: 'Bet placed!',
    ephemeral : true,
  });
}

async function start(rem) {
  // save roulette message for future reference
  const rouletteChannel = await rem.channels.cache.find(channel => channel.name === 'roulette');
  rouletteMessage = await rouletteChannel.messages.fetch('934925025834831942');
  // get current time for time stamp
  const startupTime = new Date();
  const minutesUntil30 = 30 - (startupTime.getMinutes() % 30);
  const secondsUntilMinute = 60 - startupTime.getSeconds();
  // change the next roll field
  const rouletteEmbed = rouletteMessage.embeds[1];
  let nextRollHour, nextRollMinute;
  if (startupTime.getMinutes() >= 30) {
    nextRollHour = (startupTime.getHours() % 12) + 1;
    nextRollMinute = '00';
  } else {
    nextRollHour = startupTime.getHours() % 12;
    if (nextRollHour === 0) nextRollHour = 12;
    nextRollMinute = 30;
  }
  rouletteEmbed.spliceFields(
    2, 1, { name: `${nextRollHour}:${nextRollMinute} Players`, value: 'No players', inline: true });
  rouletteMessage.edit({ embeds: [rouletteInfoEmbed, rouletteEmbed] });
  // roll at the next 30 minute mark and then roll every 30 minutes
  setTimeout(() => {
    roll(rem);
    setInterval(() => {
      roll(rem);
    }, 1000 * 60 * 30);
  }, (1000 * 60 * (minutesUntil30 - 1) + (1000 * secondsUntilMinute)));
}

async function roll(rem) {
  // simulate rolling the ball
  let rollNumber = Math.floor(Math.random() * 38);
  // check each bets to see if it won
  let resultsField = '';
  await new Promise(resolve => {
    if (playerBets.length === 0) resolve();
    playerBets.forEach(async (playerBet, index) => {
      let resultCoin = playerBet.betAmount;
      let win = false;
      // determine win based on bet type
      if (playerBet.outside) {                                          // outside bet type
        switch(playerBet.bet) {
          case '1-18':
            if (rollNumber >= 1 && rollNumber <= 18) win = true;
            break;
          case 'Even':
            if (rollNumber % 2 == 0) win = true;
            break;
          case 'Red':
            if (reds.find(number => number === rollNumber)) win = true;
            break;
          case 'Black':
            if (blacks.find(number => number === rollNumber)) win = true;
            break;
          case 'Odd':
            if ((rollNumber % 2 == 1) && rollNumber != 37) win = true;
            break;
          case '19-36':
            if (rollNumber >= 19 && rollNumber <= 36) win = true;
            break;
          case '1st 12':
            if (rollNumber >= 1 && rollNumber <= 12) {
              win = true;
              resultCoin *= 2;
            }
            break;
          case '2nd 12':
            if (rollNumber >= 13 && rollNumber <= 24) {
              win = true;
              resultCoin *= 2;
            }
            break;
          case '3rd 12':
            if (rollNumber >= 25 && rollNumber <= 36) {
              win = true;
              resultCoin *= 2;
            }
            break;
          case '1st Col':
            if (rollNumber % 3 === 1) {
              win = true;
              resultCoin *= 2;
            }
            break;
          case '2nd Col':
            if (rollNumber % 3 === 2) {
              win = true;
              resultCoin *= 2;
            }
            break;
          case '3rd Col':
            if (rollNumber % 3 === 0) {
              win = true;
              resultCoin *= 2;
            }
            break;
        }
      } else {                                                          // inside bet type
        const betValues = playerBet.bet.includes(',') ? playerBet.bet.split(',') : [playerBet.bet];
        switch (betValues.length) {
          case 6:                                                       // line bet
            if (betValues.find(value => value == rollNumber)) {
              win = true;
              resultCoin *= 5;
            }
            break;
          case 4:                                                       // corner bet
            if (betValues.find(value => value == rollNumber)) {
              win = true;
              resultCoin *= 8;
            }
            break;
          case 3:                                                       // street bet
            if (betValues.find(value => value == rollNumber)) {
              win = true;
              resultCoin *= 11;
            }
            break;
          case 2:                                                       // split bet
            if (betValues.find(value => value == rollNumber)) {
              win = true;
              resultCoin *= 17;
            }
            break;
          case 1:                                                       // straight up bet
            if (rollNumber == playerBet.bet) {
              win = true;
              resultCoin *= 35;
            } else if (rollNumber === 37 && playerBet.bet === '00') {   // 00 condition
              win = true;
              resultCoin *= 35;
              break;
            }
            break;
        }
      }
      // update data according to win or loss
      resultsField += `${playerBet.member.nickname} ${win ? 'won' : 'lost'} ` +
        `${resultCoin} coins with a ${playerBet.bet} bet!\n`;
      await Users.increment(
        { coins: (win ? +resultCoin : -resultCoin) },
        { where: { userID: playerBet.member.id } }
      );
      // resolve promise once all bets have been checked
      if (index === playerBets.length - 1) resolve();
    });
  });
  // get current time for time stamp
  const currentRollTime = new Date();
  let currentHour = currentRollTime.getHours() % 12;
  if (currentHour === 0) currentHour = 12;
  const currentMinute = currentRollTime.getMinutes();
  // output results by editing embed
  if (rollNumber === 37) rollNumber = '00';                               // represent 37 as 00
  const rouletteEmbed = rouletteMessage.embeds[1];
  const previousResults = rouletteEmbed.fields[0].value.split('\n');      // update previous results field
  previousResults.shift();                                                // remove oldest result
  const recentResult = rouletteEmbed.fields[1].name;
  previousResults.push(recentResult);                                     // add newest result
  let color;                                                              // determine if red/black/colorless
  if (reds.find(number => number === rollNumber)) color = 'Red';
  else if (blacks.find(number => number === rollNumber)) color = 'Black';
  rouletteEmbed.setFields([                                               // update roulette embed display
    {
      name: 'Previous Rolls',
      value: previousResults.join('\n'),
      inline: true,
    },
    { name: `${currentHour}:${currentMinute == 0 ? '00' : currentMinute} Results: ` +
            `${color ? color : ''} ${rollNumber}`,
      value: `${resultsField.length === 0 ? 'No players' : resultsField}`,
      inline: true
    },
    { name: `${currentMinute === 0 ? currentHour : (currentHour === 12 ? 1 : currentHour + 1)}:` +
            `${currentMinute === 0 ? currentMinute + 30: '00'} Players`,
      value: 'No players',
      inline: true
    },
  ]);
  rouletteMessage.edit({ embeds: [rouletteInfoEmbed, rouletteEmbed] });
  // reset data variables
  playerBets = [];
  playerNicknames = '';
  // update leaderboard
  leaderboardFunctions.updateGamblingLeaderboard(rem);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roulette')
    .setDescription('Play a game of Roulette')
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
        .addChoice('1st 12', '1st 12')
        .addChoice('2nd 12', '2nd 12')
        .addChoice('3rd 12', '3rd 12')
        .addChoice('1st Col', '1st Col')
        .addChoice('2nd Col', '2nd Col')
        .addChoice('3rd Col', '3rd Col')
        .addChoice('Line', 'Line')
        .addChoice('Corner', 'Corner')
        .addChoice('Street', 'Street')
        .addChoice('Split', 'Split')
        .addChoice('Straight Up', 'Straight Up'))
      .addStringOption(option =>
        option.setName('inside_bet_values')
        .setDescription(
          'Enter number(s) you want to bet (ascending) ' +
          'separated by commas, omit for outside bet'
        ))),
  execute,
  start,
  roll,
};