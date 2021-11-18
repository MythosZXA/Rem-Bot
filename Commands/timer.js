const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timer')
		.setDescription('Set a timer'),
	
  async execute(interaction) {
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
	},
};