const { Formatters } = require('discord.js');

function getSecsToMidnight() {
  const nowString = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
  const nowTime = new Date(nowString);
  const midnight = new Date(nowTime).setHours(24, 0, 0, 0);
  return (midnight - nowTime) / 1000;
}

async function updateHeroLeaderboard(rem, sequelize, DataTypes) {
  // fetch leaderboard message to update
  const guild = await rem.guilds.fetch('773660297696772096');
  const leaderboardChannel = await rem.channels.fetch('921925078541824052');
  const heroLeaderboardMessage = await leaderboardChannel.messages.fetch('923023729255141397');
  // get heroes of members
  const Hero = require('../Models/heroes')(sequelize, DataTypes);
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
  await new Promise (resolve => {
    if (heroes.length == 0) resolve();
    heroes.forEach(async (hero, index) => {                         // add each hero to display
      const member = await guild.members.fetch(hero.userID);
      displayString += 
        `${member.nickname}`.padEnd(15) +
        `${hero.level}`.padEnd(10) +
        `${hero.credits}`.padEnd(10) +
        '\n';
      if (index === heroes.length - 1) resolve();
    });
  });
  // update leaderboard
  setTimeout(() => {
    heroLeaderboardMessage.edit({                                   // update message
      content: Formatters.codeBlock(displayString) 
    });
    console.log('Hero leaderboard updated');
  }, 1000 * 3);
  // update at midnight
  setTimeout(() => {                                                // update again tomorrow
    updateHeroLeaderboard(rem, sequelize, DataTypes);
  }, (1000 * getSecsToMidnight()) + (1000 * 5));
}

async function updateGamblingLeaderboard(rem, sequelize, DataTypes) {
  // fetch leaderboard message to update
  const guild = await rem.guilds.fetch('773660297696772096');
  const leaderboardChannel = await rem.channels.fetch('921925078541824052');
  const rpsLeaderboardMessage = await leaderboardChannel.messages.fetch('932326839408533554');
  // get members with coins or rps wins
  const Users = require('../Models/users')(sequelize, DataTypes);
  const { Op } = require('sequelize');
  const guildUsers = await Users.findAll({
    where: { [Op.or]: [
      { rpsWins: { [Op.gt]: 0 } },
      { coins: { [Op.gt]: 0 } },
    ] },
    order: [[ 'coins', 'DESC' ]],
    raw: true,
  });
  if (!guildUsers) return;                                            // no members with wins
  // create leaderboard display
  let displayString =                                                 // leaderboard header
    'Top 3 will get the Gambling Addicts role\n' +
    'Gambling Addicts will receive 150 coins on check in\n\n' +
    'User'.padEnd(15) +
    'Coins'.padEnd(10) +
    'RPS Wins'.padEnd(10) +
    'Streaks'.padEnd(10) +
    '\n';
  await new Promise (resolve => {
    if (guildUsers.length === 0) resolve();
    guildUsers.forEach(async (guildUser, index) => {                  // add each user to display
      const guildMember = await guild.members.fetch(guildUser.userID);
      displayString += 
        `${guildMember.nickname}`.padEnd(15) +
        `${guildUser.coins}`.padEnd(10)+
        `${guildUser.rpsWins}`.padEnd(10) +
        `${guildUser.streak}`.padEnd(10) +
        '\n';
        // give Gambling Addicts role to top 3 members
        if (index < 3) {
          guildMember.roles.add('933834205991952467');
        } else {
          guildMember.roles.remove('933834205991952467');
        }
      if (index === guildUsers.length - 1) resolve();
    });
  });
  
  // update leaderboard
  rpsLeaderboardMessage.edit({                                      // update message
    content: Formatters.codeBlock(displayString) 
  });
  console.log('RPS leaderboard updated');
}

async function checkStreakCondition(rem, sequelize, DataTypes) {
  // update at midnight
  const secsToMidnight = getSecsToMidnight();
  setTimeout(async () => {
    const Users = require('../Models/users')(sequelize, DataTypes);
    await Users.update(                                                 // reset streak for non check ins
      { streak: 0 },
      { where: { checkedIn: 'false' } },
    );
    await Users.update(                                                 // reset check in
      { checkedIn: 'false' },
      { where: { checkedIn: 'true' } },
    );
    updateGamblingLeaderboard(rem, sequelize, DataTypes);                    // update leaderboard
  }, 1000 * secsToMidnight);
}

module.exports = {
  getSecsToMidnight,
  updateHeroLeaderboard,
  updateGamblingLeaderboard,
  checkStreakCondition,
};