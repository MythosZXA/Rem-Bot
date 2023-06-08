module.exports = {
	name: 'userUpdate',
	many: true,
	execute(oldUser, newUser, rem) {
		const user = rem.remDB.get('users').get(oldUser.id);
		user.username = newUser.username;
	}
};