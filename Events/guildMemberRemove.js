const { Users } = require('../sequelize');

module.exports = {
	name: 'guildMemberRemove',
	execute(member, rem, remDB) {
		if (member.user.bot) return;		// bot left, exit
		// remove user (locally) from db
		const users = remDB.get('users');
		const userIndex = users.findIndex(user => user.userID === member.id);
		users.splice(userIndex, 1);
		// remove user (directly) from db
		try { Users.destroy({ where: { userID: member.id } }); }
		catch(error) { console.log(error); }
	}
};