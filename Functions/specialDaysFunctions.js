const { MessageAttachment } = require('discord.js');

function secsToMidnight() {
	let currentTimeString = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
	let currentTime = new Date(currentTimeString);
	let midnight = new Date(currentTime).setHours(24, 0, 0, 0);
	return (midnight - currentTime) / 1000;
}

function checkBirthday(server, remDB, channels) {
	setTimeout(async () => {
		const guildUsers = remDB.get('users');
		// get today's month and date
		const currentTime = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
		const currentMonth = new Date(currentTime).getMonth() + 1;
		const currentDate = new Date(currentTime).getDate();
		// compare each birthday to today's date
		guildUsers.forEach(async guildUser => {
			if (!guildUser.birthday) return;		// no birthday set, no message
			// get current user birth month and date
			const birthdayFormat = guildUser.birthday.split('/');
			const userMonth = parseInt(birthdayFormat[0]);
			const userDate = parseInt(birthdayFormat[1]);
			// if it's the user's birthday
			if (userMonth == currentMonth && userDate == currentDate) {
				const bdMember = await server.members.fetch(guildUser.userID);
				// send birthday message
				const picture = new MessageAttachment('https://i.imgur.com/7IqikPC.jpg');
				const generalChannel = channels.get('console');
				generalChannel.send({
					content: `🎉🎉Happy Birthday ${bdMember}!!!🎉🎉`,
					files: [picture]
				});
			}
		});
		// check again tomorrow
		console.log(`Hours until midnight: ${secsToMidnight() / 60 / 60}`);
		checkBirthday(server, remDB, channels);
	}, (1000 * 5));
}

function checkHoliday(rem) {
	setTimeout(async () => {
		// get today's month and date
		const currentTime = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
		const currentMonth = new Date(currentTime).getMonth() + 1;
		const currentDate = new Date(currentTime).getDate();
		// christmas
		if (currentMonth == 12 && currentDate == 25) {
			const picture = new MessageAttachment('https://i.imgur.com/hURyyWx.jpg');
			const generalChannel = await rem.channels.fetch('773660297696772100');
			generalChannel.send({
				content: 'Merry Christmas @everyone',
				files: [picture]
			});
		}
		// check again tomorrow
		checkHoliday(rem);
	}, (1000 * secsToMidnight()) + (1000 * 5));
}

module.exports = {
	secsToMidnight,
	checkBirthday,
	checkHoliday
};