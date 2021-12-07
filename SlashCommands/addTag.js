const { SlashCommandBuilder } = require('@discordjs/builders');

async function execute(interaction, sequelize, DataTypes) {
  const users = require('../Models/users')(sequelize, DataTypes);
  try {
    // add userID and username to database
    await users.create({
      userID: interaction.user.id,
      username: interaction.user.tag,
    });
  
    return interaction.reply({
      content: 'Added!',
      ephemeral: true,
    });
  }
  catch(error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return interaction.reply({
        content: 'That tag already exists.',
        ephemeral: true,
      });
    }
  
    console.log(error);
    return interaction.reply({
      content: 'Something went wrong with adding a tag. Let Toan know!',
      ephemeral: true,
    });
  }
}

module.exports = {
  data: new SlashCommandBuilder()
  .setName('add_tag')
  .setDescription('Add yourself to the database'),
  execute
}