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
  const heroLeaderboardMessage = await leaderboardChannel.messages.fetch('923023729255141397');
  // get heroes of members
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  const heroes = await Hero.findAll({                               // get all heroes in DB
    order: [[ 'level', 'DESC' ]],
    raw: true,
  });
  // create leaderboard display
  let displayString =                                               // leaderboard header
    'User'.padEnd(15) +
    'Level'.padEnd(10) +
    'Credits'.padEnd(10) +
    '\n';
  await heroes.forEach(async (hero, index) => {                     // add each hero to display
    const member = await guild.members.fetch(hero.userID);
    setTimeout(() => {
      displayString += 
        `${member.nickname}`.padEnd(15) +
        `${hero.level}`.padEnd(10) +
        `${hero.credits}`.padEnd(10) +
        '\n';
    }, index * 50);
  });
  // update leaderboard
  setTimeout(() => {
    heroLeaderboardMessage.edit({                                   // update message
      content: Formatters.codeBlock(displayString) 
    });
    console.log('Hero leaderboard updated');
  }, 1000 * 5);
  // update at midnight
  setTimeout(() => {                                                // update again tomorrow
    updateHeroLeaderboard(rem, sequelize, DataTypes);
  }, (1000 * getSecsToMidnight()) + (1000 * 5));
}

async function updateStreakLeaderboard(rem, sequelize, DataTypes) {
  // fetch leaderboard message to update
  const guild = await rem.guilds.fetch('773660297696772096');
  const leaderboardChannel = await rem.channels.fetch('921925078541824052');
  const streakLeaderboardMessage = await leaderboardChannel.messages.fetch('923023883731357737');
  // get members with streaks
  const Users = require('../Models/users')(sequelize, DataTypes);
  const { Op } = require('sequelize');
  const guildMembers = await Users.findAll({                          // get users with streak
    where: { streak: { [Op.gt]: 0 } },
    order: [[ 'streak', 'DESC' ]],
    raw: true,
  });
  if (!guildMembers) return;                                          // no members with streaks
  // create leaderboard display
  let displayString =                                                 // leaderboard header
    'User'.padEnd(15) +
    'Streak'.padEnd(10) +
    '\n';
  await guildMembers.forEach(async (guildMember, index) => {          // add each user to display
    const member = await guild.members.fetch(guildMember.userID);
    setTimeout(() => {
      displayString += 
      `${member.nickname}`.padEnd(15) +
      `${guildMember.streak}`.padEnd(10) +
      '\n';
    }, index * 50);
  });
  // update leaderboard
  setTimeout(() => {
    streakLeaderboardMessage.edit({                                   // update message
      content: Formatters.codeBlock(displayString) 
    });
    console.log('Streak leaderboard updated');
  }, 1000 * 5);
  // update at midnight
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

async function updateRPSLeaderboard(rem, sequelize, DataTypes) {
  // fetch leaderboard message to update
  const guild = await rem.guilds.fetch('773660297696772096');
  const leaderboardChannel = await rem.channels.fetch('921925078541824052');
  const rpsLeaderboardMessage = await leaderboardChannel.messages.fetch('932326839408533554');
  // get members with rps wins
  const Users = require('../Models/users')(sequelize, DataTypes);
  const { Op } = require('sequelize');
  const guildMembers = Users.findAll({
    where: { rpsWins: { [Op.gt]: 0 } },
    order: [[ 'rpsWins', 'DESC' ]],
    raw: true,
  });
  if (!guildMembers) return;                                          // no members with wins
  // create leaderboard display
  let displayString =                                                 // leaderboard header
    'User'.padEnd(15) +
    'RPS Wins'.padEnd(10) +
    '\n';
  await guildMembers.forEach(async (guildMember, index) => {          // add each user to display
    const member = await guild.members.fetch(guildMember.userID);
    setTimeout(() => {
      displayString += 
        `${member.nickname}`.padEnd(15) +
        `${guildMember.rpsWins}`.padEnd(10) +
        '\n';
    }, index * 50);
  });
  // update leaderboard
  setTimeout(() => {
    rpsLeaderboardMessage.edit({                                      // update message
      content: Formatters.codeBlock(displayString) 
    });
    console.log('RPS leaderboard updated');
  }, 1000 * 5);
}

module.exports = {
  getSecsToMidnight,
  updateHeroLeaderboard,
  updateStreakLeaderboard,
  updateRPSLeaderboard,
};