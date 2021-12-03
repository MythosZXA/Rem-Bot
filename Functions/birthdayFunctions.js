const { MessageAttachment } = require("discord.js");

function getSecsToMidnight() {
  let nowString = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
  let nowTime = new Date(nowString);
  let midnight = new Date(nowTime).setHours(24, 0, 0, 0);
  return (midnight - nowTime) / 1000;
}

function checkBirthdayTomorrow(rem, sequelize, DataTypes, secsToMidnight) {
  setTimeout(async () => {
    // grabs the birthday of all users in database
    const users = require('../Models/user')(sequelize, DataTypes);
    const birthdays = await users.findAll({ attributes: ['birthday'], raw: true });
    // for each user birthday
    birthdays.forEach(async birthdayMap => {
      const birthdayString = birthdayMap.birthday;
      if (birthdayString == null) return;
      // get user birth month and date
      const birthdayFormat = birthdayString.split('-');
      const userMonth = parseInt(birthdayFormat[1]);
      const userDate = parseInt(birthdayFormat[2]);
      // get today's month and date
      now = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
      const currentMonth = new Date(now).getMonth() + 1;
      const currentDate = new Date(now).getDate();
      // if it's user's birthday
      if (userMonth == currentMonth && userDate == currentDate) {
        // get user with the birthday
        const userIDMap = await users.findAll(
          { 
            attributes: ['userID'],
            where: { birthday:  birthdayString},
            raw: true,
          },
        );
        const userID = userIDMap[0].userID;
        const bdMember = await rem.guilds.cache.get('773660297696772096').members.fetch(userID);
        // send birthday message
        const picture = new MessageAttachment('https://i.imgur.com/7IqikPC.jpg');
        const generalChannel = await rem.channels.fetch('803425860396908577');
        generalChannel.send({
          content: `Happy Birthday ${bdMember}`,
          files: [picture]
        });
      }
    });
    // check again tomorrow
    console.log(`Hours until midnight: ${getSecsToMidnight() / 60 / 60}`);
    checkBirthdayTomorrow(rem, sequelize, DataTypes, getSecsToMidnight());
  }, (1000 * secsToMidnight) + (1000 * 5));
}

function validateFormat(interaction, birthdayString) {
  let remdisappointed = interaction.client.emojis.cache.find(emoji => emoji.name === 'remdisappointed');
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
  if (userMonth == 0) {                              // zero-th month
    interaction.reply({
      content: `What is month 0?! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  } else if (userMonth < 0) {                        // negative month
    interaction.reply({
      content: `Months can\'t be negative! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  } else if (userMonth > 12) {                       // more than 12 month
    interaction.reply({
      content: `There aren\'t more than 12 months! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  }
  // validate date
  if (userDate == 0) {                               // zero-th date
    interaction.reply({
      content: `What is day 0?! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  } else if(userDate < 0) {                          // negative date
    interaction.reply({
      content: `Days cannot be negative! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  } else if (userDate > 31) {                        // more than 31 day
    interaction.reply({
      content: `There aren\'t more than 31 days! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  } else if (userDate == 31 && (userMonth == 4 ||
                                userMonth == 6 ||
                                userMonth == 9 ||
                                userMonth == 11)) {  // non-31 day months
    interaction.reply({
      content: `There aren\'t 31 days in that month! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  } else if (userDate > 29 && userMonth == 2) {      // more than 29 day in Feb
    interaction.reply({
      content: `There aren\'t that many days in February! ${remdisappointed}`,
      ephemeral: true,
    });
    return false;
  } else if (userDate == 29 && userMonth == 2) {     // 29 days on specific years
    if ((year % 4) != 0) {
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

module.exports = {
  getSecsToMidnight,
  checkBirthdayTomorrow,
  validateFormat
};