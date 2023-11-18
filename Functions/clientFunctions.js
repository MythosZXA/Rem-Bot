const { Formatters } = require('discord.js');
const { rem } = require('../main');

async function processReceipt(receiptData) {
	const server = await rem.guilds.fetch('773660297696772096');
	const rentChannel = rem.serverChannels.get('rent');
	const numMembers = receiptData.numPayers;	
	const memberNicknames = [];
	const debtAmts = [];
	const serverMembers = [];
	for (let i = 0; i < numMembers; i++) {
		memberNicknames.push(eval(`receiptData.nickname${i + 1}`));
		debtAmts.push(Number(eval(`receiptData.hiddenDebt${i + 1}`)));
		serverMembers.push(server.members.cache.find(member =>
			member.nickname?.toLowerCase() === memberNicknames[i].toLowerCase()));
	}
	// build message that @ members
	let taggedMembers = '';
	serverMembers.forEach(member => {
		taggedMembers += `${member} `;
	});
	taggedMembers += 'Time to pay up!';
	// build the code block receipt
	let displayString = `${receiptData.date}\n${receiptData.description}\n\n`;
	memberNicknames.forEach((nickname, index) => {
		displayString += nickname.padEnd(15) + debtAmts[index].toFixed(2) + '\n';
	});
	// send
	rentChannel.send(taggedMembers + Formatters.codeBlock(displayString));
}

module.exports = {
	processReceipt,
	remMessage
};