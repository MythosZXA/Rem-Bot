const { MessageEmbed } = require('discord.js');

function help(message, arg) {
  const helpEmbed = new MessageEmbed()
    .setColor(0x19EFF5)
    .setThumbnail('https://i.imgur.com/oO1SZAs.jpg')
    .addField('Normal Commands',
    `/check_in
    / pay
    /roulette
    /rps
    /set_birthday
    /timer`,
    true)
    .addField('Info',
    `| daily streaks, get 100 coins
    | give someone coins
    | play a round of roulette
    | play rock paper scissors with someone
    | birthday message on birthday
    | set a timer`,
    true)
    .addField('Playing Server Sounds',
              `Join a voice channel and send a ! followed by a space
    and then corresponding emoji to text channel => ! :emoji:`)
    // .addField('RPG Commands',
    //           `/hero
    //           /dungeon
    //           /shop
    //           /pay`);
  message.channel.send({ embeds: [helpEmbed] });
}

async function message(message, arg) {
  if (message.member.id !== '246034440340373504') return;

  // if arg[2] is nickname
  const user = (await message.guild.members.fetch()).find(guildMember => 
    guildMember.nickname?.toLowerCase() == arg[2].toLowerCase());
  // if arg[2] is text channel name
  const textChannel = (await message.guild.channels.fetch()).find(guildChannel =>
    guildChannel.name == arg[2].toLowerCase());
  // send msg to destination
  const msgToSend = arg.join(' ').substring(14 + arg[2].length);
  if (user)
    user.send(msgToSend);
  else if (textChannel)
    textChannel.send(msgToSend);
}

async function remind(message, arg) {
  // validate format
  if(arg[3] == null || !arg[arg.length - 2].toLowerCase().includes('in')) {
    message.channel.send('Invalid format. Please try again');
    return;
  }
  // create reminder string
  let reminder = '';
  for(let i = 3; i < (arg.length - 2); i++) {
    reminder += arg[i] + ' ';
  }
  reminder.trim();
  // validate & format timer
  let timerFormat = arg[arg.length - 1].split(":");
  if(timerFormat[0] < 0 || timerFormat[1] < 0 || timerFormat[2] < 0) {
    message.channel.send("No negative time!");
    return;
  }
  let hours = parseInt(timerFormat[0]);
  let minutes = parseInt(timerFormat[1]);
  let seconds = parseInt(timerFormat[2]);
  let countdown = 1000 * ((hours * 60 * 60) + (minutes * 60) + seconds);
  
  // determine who to remind
  if(arg[2] == 'me') {
    // set reminder
    setTimeout(() => {
      message.channel.send(`${message.author}, ${reminder}`);
    }, countdown);
    message.channel.send('Okay!');
  } else {
    // get user by nickname in the server
    let members = Array.from((await message.guild.members.fetch()).values());
    let target = members.filter((user) => {
      return user.nickname?.toLowerCase() == arg[2].toLowerCase();
    })[0];
    // validate user
    if(target == undefined) {
      message.channel.send(`I can't find anyone with the name ${arg[2]}`);
      return;
    }
    // set reminder
    setTimeout(() => {
      message.channel.send(`${target}, ${message.member.nickname} reminds you ${reminder}`);
    }, countdown);
    message.channel.send('Okay!');
  }
}

async function test(message, arg, sequelize, DataTypes) {
  const rouletteInfoEmbed = new MessageEmbed()
  .setColor(0x19EFF5)
  .setTitle('How to play Roulette')
  .setDescription(
    `**You are trying to guess the number that is going to be rolled**
    There are 38 numbers: **1-36**, **0**, and **00**
    You have multiple ways to place a bet:
    **Outside** bets pay is varied by the bet you make 
    => **1 to 1** bets  covers a little less than half of the board
    ===> **1-18** | **Even** | **Red** | **Black** | **Odd** | **19-36**
    => **2 to 1** covers a little less than 1/3 of the board
    ===> **1st 12** | **2nd 12** | **3rd 12** | **1st Col** | **2nd Col** | **3rd Col**
    **Inside** bets pay is varied by the bet you make
    => **Line** bets pay **5:1**, covering 6 in-order numbers (10-15)
    => **Corner** bets pay **8:1**, covering 4 adj numbers (23,24,26,27)
    => **Street** bets pay **11:1**, covering 3 in-order numbers (4,5,6)
    => **Split** bets pay **17:1**, covering 2 adj numbers (10,13 or 10,11)
    => **Straight Up** bets pay **35:1**, covering 1 number`)
  .setImage('https://i.imgur.com/SdNtESm.jpg');
const rouletteEmbed = new MessageEmbed()
.setColor(0x19EFF5)
  .setTitle('Roulette')
  .setDescription('I will roll a number every 30 minutes')
  .addField('Last roll results', 'No players', true)
  .addField('Next roll players', 'No players', true);
const channel = message.channel;
const rouletteMessage = await channel.messages.fetch('934925025834831942');
rouletteMessage.edit({ embeds: [rouletteInfoEmbed, rouletteEmbed]});
}

async function update(message, arg, seqeulize, DataTypes) {
  const leaderboardFunctions = require('./Functions/leaderboardFunctions');
  leaderboardFunctions.updateRPSLeaderboard(message.client, seqeulize, DataTypes);
}

module.exports = {
  help,
  message,
  remind,
  test,
  update,
};