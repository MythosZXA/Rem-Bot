const { MessageAttachment } = require("discord.js");

function secsToMidnight() {
  let currentTimeString = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
  let currentTime = new Date(currentTimeString);
  let midnight = new Date(currentTime).setHours(24, 0, 0, 0);
  return (midnight - currentTime) / 1000;
}

function checkBirthday(rem, sequelize, DataTypes) {
  setTimeout(async () => {
    // grabs the birthday of all users in database
    const Users = require('../Models/users')(sequelize, DataTypes);
    const guildUsers = (await Users.findAll({ raw: true }));
    // get today's month and date
    const currentTime = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
    const currentMonth = new Date(currentTime).getMonth() + 1;
    const currentDate = new Date(currentTime).getDate();
    // compare each birthday to today's date
    guildUsers.forEach(async guildUser => {
      if (!guildUser.birthday) return;                                  // no birthday set, no message
      // get user birth month and date
      const birthdayFormat = guildUser.birthday.split('-');
      const userMonth = parseInt(birthdayFormat[1]);
      const userDate = parseInt(birthdayFormat[2]);
      // if it's user's birthday
      if (userMonth == currentMonth && userDate == currentDate) {
        const server = await rem.guilds.fetch('773660297696772096');
        const bdMember = await server.members.fetch(guildUser.userID);
        // send birthday message
        const picture = new MessageAttachment('https://i.imgur.com/7IqikPC.jpg');
        const generalChannel = await rem.channels.fetch('773660297696772100');
        generalChannel.send({
          content: `🎉🎉Happy Birthday ${bdMember}!!!🎉🎉`,
          files: [picture]
        });
      }
    });
    // check again tomorrow
    console.log(`Hours until midnight: ${secsToMidnight() / 60 / 60}`);
    checkBirthday(rem, sequelize, DataTypes, secsToMidnight());
  }, (1000 * secsToMidnight()) + (1000 * 5));
}

function validateFormat(interaction, birthdayString) {
  const remdisappointed = interaction.client.emojis.cache.find(emoji => emoji.name === 'remdisappointed');
  // parse input
  const birthdayFormat = birthdayString.split('-');
  const userYear = parseInt(birthdayFormat[0]);
  const userMonth = parseInt(birthdayFormat[1]);
  const userDate = parseInt(birthdayFormat[2]);
  // validate year
  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth() + 1;
  let currentDate = new Date().getDate();
  if ((userYear > currentYear) ||
    ((userYear == currentYear) && (userMonth > currentMonth)) ||
    ((userYear == currentYear) && (userMonth > currentMonth) && (userDate > currentDate))) {
    interaction.reply({
      content: `No time travellers allowed! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  } else if (userYear < (currentYear - 100)) {
    interaction.reply({
      content: `No immortals allowed! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  }
  // validate month
  if (userMonth == 0) {                              // zero-th month, exit
    interaction.reply({
      content: `What is month 0?! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  } else if (userMonth < 0) {                        // negative month, exit
    interaction.reply({
      content: `Months can\'t be negative! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  } else if (userMonth > 12) {                       // more than 12 month, exit
    interaction.reply({
      content: `There aren\'t more than 12 months! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  }
  // validate date
  if (userDate == 0) {                               // zero-th date, exit
    interaction.reply({
      content: `What is day 0?! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  } else if(userDate < 0) {                          // negative date, exit
    interaction.reply({
      content: `Days cannot be negative! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  } else if (userDate > 31) {                        // more than 31 day, exit
    interaction.reply({
      content: `There aren\'t more than 31 days! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  } else if (userDate == 31 && (userMonth == 4 ||
                                userMonth == 6 ||
                                userMonth == 9 ||
                                userMonth == 11)) {  // non-31 day months, exit
    interaction.reply({
      content: `There aren\'t 31 days in that month! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  } else if (userDate > 29 && userMonth == 2) {      // more than 29 day in Feb, exit
    interaction.reply({
      content: `There aren\'t that many days in February! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  } else if (userDate == 29 && userMonth == 2) {     // 29 Feb days on specific years
    if ((year % 4) != 0) {                           // wrong year, exit
      interaction.reply({
        content: `February doesn\'t have 29 days that year! ${remdisappointed}`,
        ephemeral: true,
      });
      return false;
    } else {
      interaction.reply({
        content: `Ooo a special birthday!`,
        ephemeral: true,
      });
    }
  }

  return true;
}

function checkHoliday(rem) {
  setTimeout(async () => {
    // get today's month and date
    const currentTime = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
    const currentMonth = new Date(currentTime).getMonth() + 1;
    const currentDate = new Date(currentTime).getDate();
    // christmas
    if (currentMonth == 12 && currentDate == 25) {
      const picture = new MessageAttachment('https://i.imgur.com/hURyyWx.jpg');
      const generalChannel = await rem.channels.fetch('773660297696772100');
      generalChannel.send({
        content: `Merry Christmas @everyone`,
        files: [picture]
      });
    }
    // check again tomorrow
    checkHoliday(rem);
  }, (1000 * secsToMidnight()) + (1000 * 5));
}

module.exports = {
  secsToMidnight,
  checkBirthday,
  validateFormat,
  checkHoliday
};