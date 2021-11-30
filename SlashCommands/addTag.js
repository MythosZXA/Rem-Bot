const { SlashCommandBuilder } = require('@discordjs/builders');

async function execute(interaction, Users) {
  try {
    const User = await Users.create({
      userId: interaction.user.id,
      username: interaction.user.tag,
    });
  
    return interaction.reply('Added!');
  }
  catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return interaction.reply('That tag already exists.');
    }
  
    console.log(error);
    return interaction.reply('Something went wrong with adding a tag.');
  }
}

module.exports = {
  data: new SlashCommandBuilder()
  .setName('addtag')
  .setDescription('Add yourself to the database'),
  execute
}