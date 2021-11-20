const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Bulk delete messages'),

  async execute(interaction) {
    if (interaction.user.id != 246034440340373504) {
      interaction.reply({
        content: 'Lack of authority',
        ephemeral: true,
      })
      return;
    }

    
  }
};