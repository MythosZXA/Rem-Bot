module.exports = {
	name: 'guildMemberAdd',
	execute(member, rem, remDB) {
		if (member.user.bot) return;		// bot joined, exit
		// add user to db
		const users = remDB.get('users');
		users.push({
			userID: member.id,
			username: member.user.tag
		});
	}
};