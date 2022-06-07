const { SlashCommandBuilder } = require('@discordjs/builders');

async function execute(interaction) {
	// get duration of timer
	const hrs = interaction.options.getInteger('hr');
	const mins = interaction.options.getInteger('min');
	let duration = 0;
	if (hrs) duration += hrs * 60;
	if (mins) duration += mins;
	// duration validation
	const remjudge = interaction.client.emojis.cache.find(emoji => emoji.name === 'remjudge');
	if (hrs == null && mins == null) {
		interaction.reply({
			content: 'Please enter some values',
			ephemeral: true,
		});
	} else if (duration == 0) {
		interaction.reply({
			content: `Why are you even setting a timer ${remjudge}`,
			ephemeral: true,
		});
	} else {
		// confirmation message
		interaction.reply({
			content: 'I will let you know when time is up!',
			ephemeral: true,
		});
		// save info required to send msg later
		const user = interaction.user;
		// set timer
		setTimeout(() => {
			user.send(`${user} Time is up!`);
		}, 1000 * 60 * duration);
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timer')
		.setDescription('Set a timer')
		.addIntegerOption(option =>
			option.setName('hr')
				.setDescription('How many hours'))
		.addIntegerOption(option =>
			option.setName('min')
				.setDescription('How many minutes')),
	execute,
};