async function remMessage(messageData, rem) {
	const destinationName = messageData.chatName;
	const server = await rem.guilds.fetch('773660297696772096');
	const serverMember = server.members.cache.find(member => 
		member.nickname === destinationName);
	if (serverMember) {
		serverMember.send(messageData.message);
	} else {
		rem.serverChannels.get(destinationName).send(messageData.message);
	}
}

module.exports = {
	name: '/message',
	type: 'post',
	execute(req, res, rem) {
		remMessage(req.body, rem);
		res.sendStatus(200);
	}
};