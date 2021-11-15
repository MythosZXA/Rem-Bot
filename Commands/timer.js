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
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
					.addOptions([
						{
							label: '5 mins',
							description: 'Set timer for 5 mins',
							value: 'first_option',
						},
						{
							label: '10 mins',
							description: 'Set timer for 10 mins',
							value: 'second_option',
						},
					]),
			);

		await interaction.reply({ 
            content: 'How long should I set the timer for?',
            components: [row]
        });
	},
};