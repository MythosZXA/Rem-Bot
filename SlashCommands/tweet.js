const { SlashCommandBuilder } = require('@discordjs/builders');
const twitterFunctions = require('../Functions/twitterFunctions');

function execute(interaction, rem, remDB, channels) {
	const commandType = interaction.options._subcommand;
	const twitterHandle = interaction.options._hoistedOptions[0].value;
	if (commandType === 'add') add(twitterHandle, rem, remDB, channels);
	else if (commandType === 'remove') remove(twitterHandle);
}

function add(twitterHandle, rem, remDB, channels) {
	const latestTweet = twitterFunctions.getUserLatestTweet(twitterHandle);
	// build tweet URL
	let tweetURL = twitterFunctions.tweetURL;
	tweetURL.splice(3, 1, twitterHandle);
	tweetURL.splice(5, 1, latestTweet.id);
	// send latest tweet to channel
	const tweetChannel = channels.get('tweets');
	// tweetChannel.send(tweetURL.join('/'));
	console.log(tweetURL);
	// save tweet data in db
	const newTweet = {
		tweet_id: latestTweet.id,
		created_at: latestTweet.created_at,
		twitterHandle: twitterHandle,
		user_id: latestTweet.author_id
	};
	remDB.push(newTweet);
}

function remove(twitterHandle) {

}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tweet')
		.setDescription('Add/remove a twitter handle to monitor')
		.addSubcommand(subcommand =>
			subcommand.setName('add')
				.setDescription('Add a twitter user to monitor (Omit the @ sign)')
				.addStringOption(option =>
					option.setName('twitter_handle')
						.setDescription('The twitter user\'s @')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('remove')
				.setDescription('Remove a currently monitored twitter user (Omit the @ sign)')
				.addStringOption(option =>
					option.setName('twitter_handle')
						.setDescription('The twitter user\'s @')
						.setRequired(true))),
	execute,
};