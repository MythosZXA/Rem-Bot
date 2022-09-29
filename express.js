// express
const { Formatters } = require('discord.js');
const express = require('express');
const app = express();
app.listen(process.env.PORT);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./Client'));
// discord
const { rem } = require('./main');

function setupServer(remDB) {
	app.get('/', (req, res) => {
		res.sendFile(__dirname + './Client/index.html');
	});

	remDB.forEach((tableObj, tableName) => {
		app.get(`/${tableName}`, (req, res) => {
			res.send(tableObj);
		});
	});

	app.post('/message', (req, res) => {
		console.log(req.body);
		res.redirect('/');
	});

	app.post('/receipt', (req, res) => {
		processReceipt(req.body);
		res.redirect('/');
	})
}

async function processReceipt(formData) {
	const server = await rem.guilds.fetch('773660297696772096');
	const rentChannel = await rem.channels.fetch('970920325170753546');
	const numMembers = formData.numPayers;	
	const memberNicknames = [];
	const debtAmts = [];
	const serverMembers = [];
	for (let i = 0; i < numMembers; i++) {
		memberNicknames.push(eval(`formData.nickname${i + 1}`));
		debtAmts.push(Number(eval(`formData.hiddenDebt${i + 1}`)));
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
	let displayString = `${formData.date}\n${formData.description}\n\n`;
	memberNicknames.forEach((nickname, index) => {
		displayString += nickname.padEnd(15) + debtAmts[index].toFixed(2) + '\n';
	});
	rentChannel.send(taggedMembers + Formatters.codeBlock(displayString));
}

module.exports = {
	setupServer
};