const { MessageEmbed } = require('discord.js');

function help(rem, message, arg) {
  const helpEmbed = new MessageEmbed()
    .setColor(0x19EFF5)
    .setThumbnail('https://i.imgur.com/oO1SZAs.jpg')
    .addField('Normal Commands',
              `/add_tag----------| gain access to the server
              /check_in---------| daily streaks, like snapchat
              /play--------------| plays an mp3 file
              /set_birthday-----| birthday message on birthday
              /timer-------------| set a timer`)
    // .addField('RPG Commands',
    //           `/hero
    //           /dungeon
    //           /shop
    //           /pay`);
  message.channel.send({ embeds: [helpEmbed] });
}

async function message(rem, message, arg) {
  const guild = await rem.guilds.fetch('773660297696772096');
  // if arg[2] is nickname
  const user = (await guild.members.fetch()).find(guildMember => 
    guildMember.nickname?.toLowerCase() == arg[2].toLowerCase());
  // if arg[2] is text channel name
  const textChannel = (await guild.channels.fetch()).find(guildChannel =>
    guildChannel.name == arg[2].toLowerCase());
  // send msg to destination
  const msgToSend = arg.join(' ').substring(14 + arg[2].length);
  if (user)
    await user.send(msgToSend);
  else if (textChannel)
    await textChannel.send(msgToSend);
}

async function remind(rem, message, arg) {
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

async function test(rem, message, arg, sequelize, DataTypes) {
  
}

module.exports = {
  help,
  message,
  remind,
  test
};