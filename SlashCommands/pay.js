const { SlashCommandBuilder } = require("@discordjs/builders");

async function execute(interaction, sequelize, DataTypes) {
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  const nickname = interaction.options.getString('name');
  const amount = interaction.options.getNumber('amount');
  const members = await interaction.guild.members.fetch();
  let wantedMember;
  members.forEach(user => {
    if (user.nickname == null) return;
    if (user.nickname.toUpperCase() == nickname.toUpperCase())
      wantedMember = user;
  });
  // check if this transaction can be made
  const payerCreditsMap = await Hero.findOne({        // get how much credits payer has
    where: { userID: interaction.user.id },
    attributes: ['credits'],
    raw: true,
  });
  if (wantedMember == null) {                         // inputed nickname doesn't exist
    await interaction.reply({
      content:'No user with that nickname!',
      ephemeral: true,
    });
    return;
  } else if (amount <= 0) {                           // inputed amount is not positive
    await interaction.reply({
      content: 'Invalid amount',
      ephemeral: true,
    });
  } else if (payerCreditsMap.credits < amount) {      // payer doesn't have enough money
    await interaction.reply({
      content: 'You don\'t have enough credits',
      ephemeral: true,
    });
  } else {                                            // transaction possible
    await Hero.increment(                             // reduce payer credits
      { credits: -amount },
      { where: { userID: interaction.user.id } },
    );
    await Hero.increment(                             // increase receiver credits
      { credits: +amount },
      { where: { userID: wantedMember.id } },
    );
    await interaction.reply(`You paid ${wantedMember} ${amount} credits`);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Transfer credits')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The name of the user')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('amount')
        .setDescription('How much to send')
        .setRequired(true)),
  execute,
}