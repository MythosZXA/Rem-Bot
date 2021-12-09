const { SlashCommandBuilder } = require('@discordjs/builders');

async function execute(interaction, sequelize, DataTypes) {
  try {
    // validate input format
    const regex = new RegExp('[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}');
    const birthdayString = interaction.options.getString('birthday', true);
    if (!regex.test(birthdayString)) {                                    // if input isn't numbers
      interaction.reply({
        content: 'Invalid format, please try again',
        ephemeral: true,
      })
      return;
    }
    const birthdayFunctions = require('../Functions/birthdayFunctions');
    if (!birthdayFunctions.validateFormat(interaction, birthdayString)) { // if birthday is invalid
      return;
    }

    // set or update in database
    const Users = require('../Models/users')(sequelize, DataTypes);
    await Users.update(
      { birthday: birthdayString},
      { where: { userID: interaction.user.id } }
    );

    // reply to interation
    await interaction.reply({
      content: 'Birthday set!',
      ephemeral: true,
    });
  } catch(error) {
    console.log(error);
    return interaction.reply({
      content: 'Something went wrong with setting your birthday. Let Toan know!',
      ephemeral: true,
    });
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set_birthday')
    .setDescription('If you want a birthday message from Rem on your birthday')
    .addStringOption(option => 
      option.setName('birthday')
        .setDescription('yyyy-mm-dd')
        .setRequired(true)),
  execute,
}