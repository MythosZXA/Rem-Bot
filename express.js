// express
const express = require('express');
const app = express();
app.listen(process.env.PORT);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./src'));

const clientFunctions = require('./Functions/clientFunctions');

function setupServer(rem, remDB) {
	app.get('/', (req, res) => {
		res.sendFile(__dirname + '/src/index.html');
	});

	app.get('/textChannels', async (req, res) => {
		const server = await rem.guilds.fetch('773660297696772096');
		const channels = await server.channels.fetch();
		const textChannels = channels.filter(channel => channel.type === 'GUILD_TEXT');
		res.send({ channels: textChannels });
	});

	remDB.forEach((tableObj, tableName) => {
		app.get(`/${tableName}`, (req, res) => {
			res.send(tableObj);
		});
	});

	app.post('/receipt', (req, res) => {
		clientFunctions.processReceipt(req.body);
		res.redirect('/');
	});

	app.post('/message', (req, res) => {
		clientFunctions.remMessage(req.body);
		res.send({ result: 'good?'});
	});
}

module.exports = {
	setupServer
};