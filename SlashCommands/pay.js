const { SlashCommandBuilder } = require("@discordjs/builders");
const leaderboardFunctions = require('../Functions/leaderboardFunctions');

async function execute(interaction, sequelize, DataTypes) {
  // required models for transaction
  const Users = require('../Models/users')(sequelize, DataTypes);
  // required data for transaction
  const nickname = interaction.options.getString('name');
  const amount = interaction.options.getInteger('amount');
  const members = await interaction.guild.members.fetch();
  const wantedMember = members.find(user => user.nickname?.toUpperCase() === nickname.toUpperCase());
  // check if this transaction can be made
  const { coins } = await Users.findOne({                   // get how much coins payer has
    where: { userID: interaction.user.id },
    attributes: ['coins'],
    raw: true,
  });
  if (wantedMember == null) {                               // inputed nickname doesn't exist, exit
    interaction.reply({
      content:'No user with that nickname!',
      ephemeral: true,
    });
    return;
  } else if (interaction.user.id == wantedMember.id) {      // same person, exit
    const remDisappointed = await interaction.guild.emojis.fetch('892913382607425566');
    interaction.reply({
      content: `You cannot give coins to yourself! ${remDisappointed}`,
      ephemeral: true,
    });
    return;
  } else if (amount <= 0) {                                 // inputed amount is negative, exit
    interaction.reply({
      content: 'Invalid amount',
      ephemeral: true,
    });
    return;
  } else if (coins < amount) {                              // payer doesn't have enough money, exit
    interaction.reply({
      content: 'You don\'t have enough coins',
      ephemeral: true,
    });
    return;
  }
  // execute transaction
  await Users.increment(                                    // reduce payer coins
    { coins: -amount },
    { where: { userID: interaction.user.id } },
  );
  await Users.increment(                                    // increase receiver coins
    { coins: +amount },
    { where: { userID: wantedMember.id } },
  );
  interaction.reply(`You paid ${wantedMember} ${amount} coins`);
  leaderboardFunctions.updateRPSLeaderboard(interaction.client, sequelize, DataTypes);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Transfer coins')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The name of the user')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('How much to send')
        .setRequired(true)),
  execute,
}