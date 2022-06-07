const { MessageEmbed } = require('discord.js');
const leaderboardFunctions = require('./Functions/leaderboardFunctions');
const execSync = require('child_process').execSync;

function help(message) {
	const helpChannel = message.client.channels.cache.find(channel => channel.name === 'help');
	const helpEmbed = new MessageEmbed()
		.setColor(0x19EFF5)
		.setThumbnail('https://i.imgur.com/oO1SZAs.jpg')
		.addField('Normal Commands',
			`/check_in
      /pay
      /roulette bet
      /rps
      /set_birthday
      /timer`,
			true)
		.addField('Info',
			`| daily streaks, get 100 coins
      | give someone coins
      | place bets on the next round of #roulette
      | play rock paper scissors with someone
      | birthday message on birthday
      | set a timer`,
			true);
	helpChannel.send({ embeds: [helpEmbed] });
}

function lock(message) {
	if (message.author.id != process.env.toan) return;
	execSync('rundll32.exe user32.dll,LockWorkStation');
}

async function message(message, arg) {
	if (message.member.id !== process.env.toan) return;

	// if arg[2] is nickname
	const user = (await message.guild.members.fetch()).find(guildMember => 
		guildMember.nickname?.toLowerCase() == arg[2].toLowerCase());
	// if arg[2] is text channel name
	const textChannel = (await message.guild.channels.fetch()).find(guildChannel =>
		guildChannel.name == arg[2].toLowerCase());
	// send msg to destination
	const msgToSend = arg.join(' ').substring(14 + arg[2].length);
	if (user)
		user.send(msgToSend);
	else if (textChannel)
		textChannel.send(msgToSend);
}

async function test(message) {
	if (message.author.id != process.env.toan) return;
}

async function update(message) {
	leaderboardFunctions.updateGamblingLeaderboard(message.client);
}

module.exports = {
	help,
	lock,
	message,
	test,
	update,
};