const { SlashCommandBuilder } = require("@discordjs/builders");
const { Users } = require('../sequelize');
const leaderboardFunctions = require('../Functions/leaderboardFunctions');

async function execute(interaction) {
  const userID = interaction.user.id;
  const guildUser = await Users.findOne({ where: { userID: userID }, raw: true });
  if (guildUser.checkedIn == 'true') {                      // user already checked in, exit
    interaction.reply({
      content: 'You have already checked in today',
      ephemeral: true,
    });
    return;
  }
  await Users.increment(                                    // increase streak & coins
    { streak: +1 , coins: +100 },
    { where: { userID: userID } },
  );
  // check if this member is top 3 gamblers
  const hasRole = interaction.member.roles.cache.find(role => role.name === 'Gambling Addicts');
  if (hasRole) {
    await Users.increment(                                  // give gambling addicts 50 more coins
      { coins: +50 },
      { where: { userID: userID } },
    );
  }
  Users.update(                                             // set check in to be true
    { checkedIn: 'true' },
    { where: { userID: userID } },
  );
  interaction.reply({                                       // confirmation message
    content: 'You have checked in for the day & received ' +
    `${hasRole ? '150' : '100'} coins`,
    ephemeral: true,
  });
  leaderboardFunctions.updateGamblingLeaderboard(interaction.client);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check_in')
    .setDescription('Check in for daily streak'),
  execute,
}