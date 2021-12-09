const { SlashCommandBuilder } = require("@discordjs/builders");

async function execute(interaction, sequelize, DataTypes) {
  // required models for transaction
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  // required data for transaction
  const nickname = interaction.options.getString('name');
  const amount = interaction.options.getInteger('amount');
  const members = await interaction.guild.members.fetch();
  const wantedMember = members.find(user => user.nickname?.toUpperCase() === nickname.toUpperCase());
  // check if this transaction can be made
  const { credits } = await Hero.findOne({                 // get how much credits payer has
    where: { userID: interaction.user.id },
    attributes: ['credits'],
    raw: true,
  });
  if (wantedMember == null) {                              // inputed nickname doesn't exist
    await interaction.reply({
      content:'No user with that nickname!',
      ephemeral: true,
    });
    return;
  } else if (interaction.user.id == wantedMember.id) {     // same person
    const remDisappointed = await interaction.guild.emojis.fetch('892913382607425566');
    await interaction.reply({
      content: `You cannot give credits to yourself! ${remDisappointed}`,
      ephemeral: true,
    })
  } else if (amount <= 0) {                                // inputed amount is not positive
    await interaction.reply({
      content: 'Invalid amount',
      ephemeral: true,
    });
  } else if (credits < amount) {                           // payer doesn't have enough money
    await interaction.reply({
      content: 'You don\'t have enough credits',
      ephemeral: true,
    });
  } else {                                                 // transaction possible
    await Hero.increment(                                  // reduce payer credits
      { credits: -amount },
      { where: { userID: interaction.user.id } },
    );
    await Hero.increment(                                  // increase receiver credits
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
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('How much to send')
        .setRequired(true)),
  execute,
}