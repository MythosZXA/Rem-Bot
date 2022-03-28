const { SlashCommandBuilder } = require("@discordjs/builders");
const { Users } = require('../sequelize');
const leaderboardFunctions = require('../Functions/leaderboardFunctions');

async function execute(interaction) {
  // check if member can check in
  const userID = interaction.user.id;
  const guildUser = await Users.findOne({ where: { userID: userID }, raw: true });
  if (guildUser.checkedIn == 'true') {                      // user already checked in, exit
    interaction.reply({
      content: 'You have already checked in today',
      ephemeral: true,
    });
    return;
  }
  // increase stats
  await Users.increment(                                    // increase base streak & coins
    { streak: +1 , coins: +100 },
    { where: { userID: userID } },
  );
  let totalDistribution = 100;
  await Users.increment(                                    // increase coins for streak
    { coins: +(guildUser.streak * 10) },
    { where: { userID: userID } },
  );
  totalDistribution += guildUser.streak * 10;
  // check if this member is top 3 gamblers
  const hasRole = interaction.member.roles.cache.find(role => role.name === 'Gambling Addicts');
  if (hasRole) {
    await Users.increment(                                  // give gambling addicts 50 more coins
      { coins: +50 },
      { where: { userID: userID } },
    );
    totalDistribution += 50;
  }
  // check if this member has a farm
  const farmLevel = guildUser.farmLv;
  if (farmLevel !== null) {                                 // give farmer owners more coins
    await Users.increment(
      { coins: +(200 + (farmLevel * 50))},
      { where: { userID: userID } },
    );
    totalDistribution += 200 + (farmLevel * 50);
  }
  // update check in conditions
  Users.update(                                             // set check in to be true
    { checkedIn: 'true' },
    { where: { userID: userID } },
  );
  // send confirmation message
  interaction.reply({                                       // confirmation message
    content: `You have checked in for the day & received ${totalDistribution} coins`,
    ephemeral: true,
  });
  // update leaderboard
  leaderboardFunctions.updateGamblingLeaderboard(interaction.client);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check_in')
    .setDescription('Check in for daily streak'),
  execute,
}