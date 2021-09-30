const { MessageEmbed, MessageAttachment, BitField } = require('discord.js');
const fs = require('fs');

function clear(message, rpgProfiles, arg) {
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

function help(message) {
  const info = new MessageEmbed()
    .setColor(0x19EFF5)
    .attachFiles(new MessageAttachment('./Picures/Rem.jpg', 'Rem.jpg'))
    .setThumbnail('attachment://Rem.jpg')
    .setDescription('To call for me, start a command off with \'Rem, \'')
    .addField('Normal Commands',
              `Remind [me/person] [message] in [hh:mm:ss]
              setBirthday [mm/dd/yyyy]`)
    .addField('Genshin Commands',
              `Daily`)
    // .addField('Music',
    //           `play,
    //           skip,
    //           stop`)
    .addField('RPG Commands',
              `Hero
              setName
              setColor
              setImage
              Adventure`);

  message.channel.send(info);
}

async function remind(message, rpgProfiles, arg) {
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

function save(message, rpgProfiles) {
  if(message.author.id != 246034440340373504) {
    message.channel.send('Lack of authority');
    return;
  }

  let rpgProfilesTable = {
    table: []
  };
  const iterator = rpgProfiles.values();
  const iteratorFlag = rpgProfiles.values();
  do {
    rpgProfilesTable.table.push(iterator.next().value);
  } while (!iteratorFlag.next().done);

  fs.writeFile('./rpgProfiles.json', JSON.stringify(rpgProfilesTable, null, '\t'), error => {
    if (error) {
        console.log('Error writing file', error)
    } else {
        console.log('Successfully wrote file')
        message.channel.send('Saved!');
    }
  });
}

function setBirthday(message, rpgProfiles, arg, userProfiles) {
  // validate input
  if (!arg[2].includes('/')) {
    message.channel.send('Invalid format. Please try again');
    return;
  }
  let birthdayFormat = arg[2].split('/');
  if (birthdayFormat.length < 3) {
    message.channel.send('Invalid format. Please try again');
    return;
  }
  let month = parseInt(birthdayFormat[0]);
  let day = parseInt(birthdayFormat[1]);
  let year = parseInt(birthdayFormat[2]);
  let remdisappointed = message.client.emojis.cache.find(emoji => emoji.name === 'remdisappointed');

  // years
  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth();
  let currentDate = new Date().getDate();
  if ((year > currentYear) || 
      ((year > currentYear) && (month > currentMonth)) ||
      ((year > currentYear) && (month > currentMonth) && (day > currentDate))) {
    message.channel.send(`No time travellers allowed! ${remdisappointed}`);
    return;
  } else if (year < (currentYear - 100)) {
    message.channel.send(`No immortals allowed! ${remdisappointed}`);
    return;
  }

  // months
  if (month == 0) {
    message.channel.send(`What is month 0?! ${remdisappointed}`);
    return;
  } else if (month < 0) {
    message.channel.send(`Months can\'t be negative! ${remdisappointed}`);
    return;
  } else if (month > 12) {
    message.channel.send(`There aren\'t more than 12 months! ${remdisappointed}`);
    return;
  }

  // days
  if (day == 0) {
    message.channel.send(`What is day 0?! ${remdisappointed}`);
    return;
  } else if(day < 0) {
    message.channel.send(`Days cannot be negative! ${remdisappointed}`);
    return;
  } else if (day > 31) {
    message.channel.send(`There aren\'t more than 31 days! ${remdisappointed}`);
    return;
  } else if (day == 31 && (month == 4 ||
                           month == 6 ||
                           month == 9 ||
                           month == 11)) {
    message.channel.send(`There aren\'t 31 days in that month! ${remdisappointed}`);
    return;
  } else if (day > 29 && month == 2) {
    message.channel.send(`There aren\'t that many days in February! ${remdisappointed}`);
    return;
  } else if (day == 29 && month == 2) {
    if ((year % 4) != 0) {
      message.channel.send(`February doesn\'t have 29 days that year! ${remdisappointed}`);
      return;
    }
    message.channel.send('Ooo a special birthday');
  }
  
  // set birthday after passing validation checks
  userProfiles.get(message.author.id).birthday = arg[2];

  // save to file
  let userProfilesTable = {
    table: []
  };
  const iterator = userProfiles.values();
  const iteratorFlag = userProfiles.values();
  do {
    userProfilesTable.table.push(iterator.next().value);
  } while (!iteratorFlag.next().done);

  fs.writeFile('./userProfiles.json', JSON.stringify(userProfilesTable, null, '\t'), error => {
    if (error) {
      console.log('Error writing file', error)
  } else {
      console.log('Successfully wrote file')
      message.channel.send('Set!');
  }
  });
}

function test(message, rpgProfiles, arg, userProfile) {
  message.channel.send(userProfile.get(message.author.id).name);
}

module.exports = {
  clear,
  help,
  remind,
  save,
  'setbirthday' : setBirthday,
  test
};