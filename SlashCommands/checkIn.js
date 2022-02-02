const { SlashCommandBuilder } = require("@discordjs/builders");

async function execute(interaction, sequelize, DataTypes) {
  // required models for check in
  const User = require('../Models/users')(sequelize, DataTypes);
  const leaderboardFunctions = require('../Functions/leaderboardFunctions');
  const interactionMember = interaction.member;
  const guildUser = await User.findOne({ where: { userID: interaction.user.id }, raw: true });
  if (guildUser.checkedIn == 'true') {                      // user already checked in
    interaction.reply({                                     // notify user
      content: 'You have already checked in today',
      ephemeral: true,
    });
  } else {                                                  // user haven't checked in
    await User.increment(                                   // increase streak & coins
      { streak: +1 , coins: +100 },
      { where: { userID: interactionMember.id } },
    );
    // check if this member is top 3 gamblers
    const hasRole = interactionMember.roles.cache.find(role => role.name === 'Gambling Addicts');
    if (hasRole) {
      await User.increment(                                 // give gambling addicts 50 more coins
        { coins: +50 },
        { where: { userID: interactionMember.id } },
      )
    }
    User.update(                                            // set check in to be true
      { checkedIn: 'true' },
      { where: { userID: interactionMember.id } },
    );
    interaction.reply({                                     // confirmation message
      content: 'You have checked in for the day & received ' +
      `${hasRole ? '150' : '100'} coins`,
      ephemeral: true,
    });
    leaderboardFunctions.updateGamblingLeaderboard(interaction.client, sequelize, DataTypes);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check_in')
    .setDescription('Check in for daily streak'),
  execute,
}