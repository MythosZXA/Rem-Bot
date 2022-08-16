const { SlashCommandBuilder } = require('@discordjs/builders');
const leaderboardFunctions = require('../Functions/leaderboardFunctions');

async function execute(interaction, rem, remDB, channels) {
	// check if member can check in
	const userID = interaction.user.id;
	const guildUser = remDB.get('users').find(user => user.userID === userID);
	if (guildUser.checkedIn == 'true') {		// user already checked in, exit
		interaction.reply({
			content: 'You have already checked in today',
			ephemeral: true,
		});
		return;
	}
	// calculate coins
	let totalDistribution = 100;		// base check in
	totalDistribution += guildUser.streak * 10;		// streak multiplier
	const hasRole = interaction.member.roles.cache.find(role => role.name === 'Gambling Addicts');
	if (hasRole) totalDistribution += 50;		// gamblimg addicts title
	// increase coins & streak
	guildUser.coins += totalDistribution;
	guildUser.streak++;
	// update check in conditions
	guildUser.checkedIn = 'true';
	// send confirmation message
	interaction.reply({
		content: `You have checked in for the day & received ${totalDistribution} coins`,
		ephemeral: true,
	});
	// update leaderboard
	leaderboardFunctions.updateGamblingLeaderboard(rem, remDB, channels);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('check_in')
		.setDescription('Check in for daily streak'),
	execute,
};