const { Formatters } = require('discord.js');

function getSecsToMidnight() {
  let nowString = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
  let nowTime = new Date(nowString);
  let midnight = new Date(nowTime).setHours(24, 0, 0, 0);
  return (midnight - nowTime) / 1000;
}

async function updateHeroLeaderboard(rem, sequelize, DataTypes) {
  // fetch leaderboard message to update
  const guild = await rem.guilds.fetch('773660297696772096');
  const leaderboardChannel = await rem.channels.fetch('921925078541824052');
  const heroLeaderboardMessage = await leaderboardChannel.messages.fetch('921938788991791155');
  // update leaderboard
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  const heroes = await Hero.findAll({                               // get all heroes in DB
    order: [[ 'level', 'DESC' ]],
    raw: true,
  });
  let displayString =                                               // leaderboard header
    'User'.padEnd(15) +
    'Level'.padEnd(10) +
    'Credits'.padEnd(10) +
    '\n';
  await heroes.forEach(async hero => {                              // add each hero to display
    const user = await guild.members.fetch(hero.userID);
    displayString += 
      `${user.nickname}`.padEnd(15) +
      `${hero.level}`.padEnd(10) +
      `${hero.credits}`.padEnd(10) +
      '\n';
  });
  setTimeout(async () => {
    heroLeaderboardMessage.edit({                                   // update message
      content: Formatters.codeBlock(displayString) 
    });
    console.log('Hero leaderboard updated');
  }, 1000 * 5);
  setTimeout(() => {                                                // update again tomorrow
    updateHeroLeaderboard(rem, sequelize, DataTypes);
  }, (1000 * getSecsToMidnight()) + (1000 * 5));
}

async function updateStreakLeaderboard(rem, sequelize, DataTypes) {
  // fetch leaderboard message to update
  const guild = await rem.guilds.fetch('773660297696772096');
  const leaderboardChannel = await rem.channels.fetch('921925078541824052');
  const streakLeaderboardMessage = await leaderboardChannel.messages.fetch('921942698242482217');
  // update leaderboard
  const Users = require('../Models/users')(sequelize, DataTypes);
  const guildUsers = await Users.findAll({                            // get all users in DB
    order: [[ 'streak', 'DESC' ]],
    raw: true,
  });
  let displayString =                                                 // leaderboard header
    'User'.padEnd(15) +
    'Streak'.padEnd(10) +
    '\n';
  await guildUsers.forEach(async guildUser => {                       // add each user to display
    const user = await guild.members.fetch(guildUser.userID);
    displayString += 
      `${user.nickname}`.padEnd(15) +
      `${guildUser.streak}`.padEnd(10) +
      '\n';
  });
  setTimeout(async () => {
    streakLeaderboardMessage.edit({                                   // update message
      content: Formatters.codeBlock(displayString) 
    });
    console.log('Streak leaderboard updated');
  }, 1000 * 5);
  setTimeout(async () => {
    await Users.update(                                               // reset streak for non check ins
      { streak: 0 },
      { where: { checkedIn: 'false' } },
    );
    await Users.update(                                               // reset check in
      { checkedIn: 'false' },
      { where: { checkedIn: 'true' } },
    );
    updateStreakLeaderboard(rem, sequelize, DataTypes);               // update again tomorrow
  }, (1000 * getSecsToMidnight()) + (1000 * 5));
}

module.exports = {
  getSecsToMidnight,
  updateHeroLeaderboard,
  updateStreakLeaderboard,
};