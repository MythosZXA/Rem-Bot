const { SlashCommandBuilder } = require("@discordjs/builders");

async function execute(interaction, sequelize, DataTypes) {
  const User = require('../Models/users')(sequelize, DataTypes);
  const guildUser = await User.findOne({ where: { userID: interaction.user.id }, raw: true });
  if (guildUser.checkedIn == 'true') {                      // user already checked in
    await interaction.reply({                               // notify user
      content: 'You have already checked in today',
      ephemeral: true,
    });
  } else {                                                  // user haven't checked in
    await User.increment(                                   // increase streak
      { streak: +1 },
      { where: { userID: interaction.user.id } }
    );
    await User.update(                                      // set check in to be true
      { checkedIn: 'true' },
      { where: { userID: interaction.user.id } },
    );
    await interaction.reply({                               // confirmation message
      content: 'You have checked in for the day',
      ephemeral: true,
    });
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check_in')
    .setDescription('Check in for daily streak'),
  execute,
}