module.exports = {
	name: '/messageHistory',
	type: 'post',
	async execute(req, res, rem, expressGlobal) {
		if (expressGlobal.admins.has(req.cookies.sessionID)) {
			const server = await rem.guilds.fetch('773660297696772096');
			const chatName = req.body.chatName;
			const serverMember = server.members.cache.find(member => member.nickname === chatName);
			const dmChannel = await serverMember.user.createDM();
			const messageHistory = await dmChannel.messages.fetch({ limit: 20 });
			res.send([...messageHistory.values()].map(message => [message.author.bot, message.content]));
		} else {
			res.sendStatus(401);
		}
	}
};