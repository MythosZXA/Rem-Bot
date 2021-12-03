const fs = require('fs');

function clear(message, arg) {
  if(message.author.id != 246034440340373504) {
    message.channel.send('Lack of authority');
    return;
  }

  message.channel.bulkDelete(arg[2])
    .catch((error) => {
      message.channel.send("I can only clear between 1-100 messages that are not older than 2 weeks");
      console.log(error);
    });
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

function test(message, arg, userMap) {
  
}

module.exports = {
  clear,
  remind,
  test
};