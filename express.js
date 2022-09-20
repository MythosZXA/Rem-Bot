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
	for (let i = 1; i <= numMembers; i++) {
		memberNicknames.push(eval(`formData.nickname${i}`));
		debtAmts.push(Number(eval(`formData.hiddenDebt${i}`)));
	}
	const serverMembers = [];
	for (let i = 1; i <= numMembers; i++) {
		serverMembers.push(server.members.cache.find(member =>
			member.nickname?.toLowerCase() === memberNicknames[i-1].toLowerCase()));
	}
	let taggedMembers = '';
	serverMembers.forEach(member => {
		taggedMembers += `${member} `;
	});
	taggedMembers += 'Time to pay up!';
	let displayString = formData.date + '\n' + formData.description.padEnd(15) + '\n\n';
	memberNicknames.forEach((nickname, index) => {
		displayString += nickname.padEnd(15) + debtAmts[index].toFixed(2) + '\n';
	});
	rentChannel.send(taggedMembers + Formatters.codeBlock(displayString));
}

module.exports = {
	setupServer
};