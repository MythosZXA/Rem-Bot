const { MessageAttachment } = require('discord.js');

/**
 * Every day at midnight, check if any user's birthday, and if so, send a birthday message to
 * the general channel
 * @param server - the Discord server
 * @param remDB - the database for this project
 * @param channels - a Map of all the channels in the server
 */
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
				const bdMember = await server.members.fetch(guildUser.id);
				// send birthday message
				const picture = new MessageAttachment('https://i.imgur.com/7IqikPC.jpg');
				const generalChannel = channels.get('general');
				generalChannel.send({
					content: `🎉🎉Happy Birthday ${bdMember}!!!🎉🎉`,
					files: [picture]
				});
			}
		});
		// check again tomorrow
		console.log(`Hours until midnight: ${secsToMidnight() / 60 / 60}`);
		checkBirthday(server, remDB, channels);
	}, (1000 * secsToMidnight()) + (1000 * 5));
}

/**
 * Every day at midnight, check if it's a holiday. If it is, send a message to the general channel
 * @param channels - a Map of all the channels in the server
 */
function checkHoliday(channels) {
	setTimeout(async () => {
		// get today's month and date
		const currentTime = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
		const currentMonth = new Date(currentTime).getMonth() + 1;
		const currentDate = new Date(currentTime).getDate();
		// christmas
		if (currentMonth == 12 && currentDate == 25) {
			const picture = new MessageAttachment('https://i.imgur.com/hURyyWx.jpg');
			const generalChannel = channels.get('general');
			generalChannel.send({
				content: 'Merry Christmas @everyone',
				files: [picture]
			});
		}
		// check again tomorrow
		checkHoliday(channels);
	}, (1000 * secsToMidnight()) + (1000 * 5));
}

function secsToMidnight() {
	let currentTimeString = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
	let currentTime = new Date(currentTimeString);
	let midnight = new Date(currentTime).setHours(24, 0, 0, 0);
	return (midnight - currentTime) / 1000;
}

module.exports = {
	checkBirthday,
	checkHoliday,
	secsToMidnight
};