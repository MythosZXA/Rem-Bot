const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const leaderboardFunctions = require('./Functions/leaderboardFunctions');
const execSync = require('child_process').execSync;
const { XMLHttpRequest } = require('xmlhttprequest');

function help(message, arg) {
  const helpEmbed = new MessageEmbed()
    .setColor(0x19EFF5)
    .setThumbnail('https://i.imgur.com/oO1SZAs.jpg')
    .addField('Normal Commands',
    `/check_in
    /pay
    /roulette bet
    /rps
    /set_birthday
    /timer`,
    true)
    .addField('Info',
    `| daily streaks, get 100 coins
    | give someone coins
    | place bets on the next round of #roulette
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

function lock(message) {
  if (message.author.id != process.env.toan) return;
  execSync('rundll32.exe user32.dll,LockWorkStation');
}

async function message(message, arg) {
  if (message.member.id !== process.env.toan) return;

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

async function test(message, arg) {
  if (message.author.id != process.env.toan) return;

  // var xmlHttp = new XMLHttpRequest();
  // xmlHttp.open( "GET", 'https://public-api.tracker.gg/v2/apex/standard/profile/5/MythosZXA', false ); // false for synchronous request
  // xmlHttp.setRequestHeader('TRN-Api-Key', process.env.trackerKey);
  // xmlHttp.send();
  // const regexp = /"value":\d*/g
  // const str = [...xmlHttp.responseText.matchAll(regexp)];
  // message.channel.send(str[1][0].split(':')[1]);

  const farmEmbed = new MessageEmbed()
    .setColor('GREEN')
    .setThumbnail('https://i.imgur.com/bZuenoY.png')
    .setTitle('Banana Farm')
    .setDescription('Increases your check in value')
    .addFields(
      { name: 'Base Farm', value: '**5000 Coins**\nIncreases check in value by 200'},
      { name: 'Upgrades (Limit 5)', value: '**2500 Coins**\nIncreases check in value by 50'},
    );
  const upgradeButton = new MessageButton()
    .setCustomId('upgrade')
    .setLabel('Upgrade')
    .setStyle('SUCCESS');
  const buyButton = new MessageButton()
    .setCustomId('buy')
    .setLabel('Buy')
    .setStyle('SUCCESS');
  const actionRow = new MessageActionRow().addComponents(upgradeButton, buyButton);
  message.channel.send({
    embeds: [farmEmbed],
    components: [actionRow],
  }).then(nmessage =>{
    nmessage.buttonType = 'shop';
  });
}

async function update(message, arg) {
  leaderboardFunctions.updateGamblingLeaderboard(message.client);
}

module.exports = {
  help,
  lock,
  message,
  test,
  update,
};