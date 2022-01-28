const { SlashCommandBuilder } = require("@discordjs/builders");

async function execute(interaction) {
  if (interaction.user.id != '246034440340373504') {
    await interaction.reply({
      content: 'You do not have permission to use this command',
      ephemeral: true,
    });
  }
  try {
    await interaction.channel.bulkDelete(interaction.options.getNumber('amount', true));
    const message = await interaction.reply({
      content: 'Deleted',
      fetchReply: true,
    });
    message.delete();
  } catch(error) {
    interaction.reply({
      content: 'I can only clear between 1-100 messages that are not older than 2 weeks',
      ephemeral: true,
    });
    console.log(error);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear multiple messages (Restricted)')
    .addNumberOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete')
        .setRequired(true)
    ),
  execute
}