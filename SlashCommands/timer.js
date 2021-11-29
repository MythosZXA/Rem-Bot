const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

async function execute(interaction) {
  const row = new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
        .setCustomId('selectTimer')
        .setPlaceholder('Nothing selected')
        .addOptions([
          {
            label: '5 mins',
            value: '5',
          },
          {
            label: '10 mins',
            value: '10',
          },
          {
            label: '15 mins',
            value: '15',
          },
          {
            label: '30 mins',
            value: '30',
          },
          {
            label: '1 hour',
            value: '60',
          },
        ]),
    );

  await interaction.reply({ 
    content: 'How long should I set the timer for?',
    components: [row],
    ephemeral: true
  });

  await setTimeout(() => {
    interaction.fetchReply()
      .then(reply => {
        if (reply.components.length != 0) {
          interaction.editReply({
            content: 'Request timed out',
            components: []
          })
        } // if
      }) // then
      .catch(console.error);
  }, 1000 * 10);
}

async function setTimer(interaction) {
  const duration = interaction.values[0];
  await interaction.update({
    content: 'I will let you know when time is up!',
    components: [],
    ephemeral: true
  }).catch(console.error);

  setTimeout(() => {
    interaction.followUp({
      content: `${interaction.user} Time is up!`,
      ephemeral: true
    });
  }, 1000 * 60 * duration);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timer')
		.setDescription('Set a timer'),
	execute,
  setTimer
};