const prefixCommands = require('../prefixCommands');

module.exports = {
	name: 'messageCreate',
	many: true,
	execute(message, rem, remDB, channels) {
		const consoleChannel = channels.get('console');
		
		console.log(`${message.author.username}: ${message.content}`);
		if (message.author.bot) return;		// rem sent a message, exit
		// log DMs to Rem
		if (!message.inGuild() && message.author.id != process.env.toan) {
			consoleChannel.send(`${message.author.username.toUpperCase()}: ${message.content}`);
		}
		// misc responses
		if (message.content.toLowerCase().includes('thanks rem')) {
			if (message.author.id === process.env.toan) {
				const remhehe = rem.emojis.cache.find(emoji => emoji.name === 'remhehe');
				message.channel.send(`${remhehe}`);
			} else {
				message.channel.send('You\'re welcome!');
			}
			return;
		} else if (message.content.includes('🙁')) {
			message.react('🙁');
			return;
		}

		const arg = message.content.split(' ');
		// check if message is a prefix command
		if (arg[0].toLowerCase() != 'rem,') return;
		prefixCommands[arg[1].toLowerCase()]?.(message, arg, remDB, channels);
	}
};