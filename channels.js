/**
 * It fetches all the channels in a server and returns a map of channel names to channel objects.
 * @param guild - The server object that you want to get the channels from.
 * @returns A Map of channel names and channel objects.
 */
async function getServerChannels(guild) {
	const channels = new Map();
	const serverChannels = await guild.channels.fetch();
	serverChannels.forEach(channel => {
		const channelName = channel.name;
		channels.set(channelName, channel);
	});

	return channels;
}

module.exports = {
	getServerChannels
};