const { SlashCommandBuilder } = require('@discordjs/builders');
const { Formatters } = require('discord.js');

function execute(interaction) {
	// get users involved with this receipt
	const nicknames = interaction.options.getString('users').split(',');
	const guildMembers = [];
	nicknames.forEach(nickname => {
		const nicknameMember = interaction.guild.members.cache.find(member =>
			member.nickname?.toLowerCase() === nickname.toLowerCase());
		guildMembers.push(nicknameMember);
	});

	// get receipt data
	const date = interaction.options.getString('date');
	const description = interaction.options.getString('description');
	const receiptInput = interaction.options.getString('items');
	const itemsData = receiptInput.split('+');
	const taxAmount = interaction.options.getNumber('tax');

	// calculate who owes what
	const amountOwed = new Array(guildMembers.length);
	amountOwed.fill(0);
	itemsData.forEach(itemString => {
		const itemData = itemString.split('=');
		const itemBuyers = itemData[1].split(',');
		itemBuyers.forEach(buyerIndex => {
			const amount = parseFloat(itemData[0]) / itemBuyers.length;
			amountOwed[buyerIndex] += amount;
		});
	});
	// add in tax
	for (let i = 0; i < amountOwed.length; i++) {
		amountOwed[i] += taxAmount / amountOwed.length;
	}
  
	// create display string
	let taggedMembers = '';
	guildMembers.forEach(member => {
		taggedMembers += `${member} `;
	});
	taggedMembers += 'Time to pay up!';
	let displayString = date + '\n' + description.padEnd(15) + '\n\n';
	nicknames.forEach((nickname, index) => {
		displayString += nickname.padEnd(15) + amountOwed[index].toFixed(2) + '\n';
	});

	// send result by replying to command
	interaction.reply(taggedMembers + Formatters.codeBlock(displayString));
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('receipt')
		.setDescription('Calculate who owes what')
		.addStringOption(option =>
			option.setName('users')
				.setDescription('nickname1,nickname2,nickname3 E.g. toan,munh,t.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('date')
				.setDescription('mm/dd')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('description')
				.setDescription('Any details regarding this receipt')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('items')
				.setDescription('price1=user#,user#,user#+price2=0,2,3 E.g. 150.52=0,2+31.20=1,2')
				.setRequired(true))
		.addNumberOption(option =>
			option.setName('tax')
				.setDescription('How much was tax')
				.setRequired(true)),
	execute,
};