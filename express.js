// express
const express = require('express');
const app = express();
app.listen(process.env.PORT);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./src'));

const clientFunctions = require('./Functions/clientFunctions');
const memberCodes = new Map();
let clients = [];
let tictactoe = ['.','.','.','.','.','.','.','.','.'];

async function setupServer(rem, remDB) {
	const server = await rem.guilds.fetch('773660297696772096');

	app.get('/', (req, res) => {
		res.sendFile(__dirname + '/src/index.html');
	});

	app.get('/textChannels', async (req, res) => {
		const server = await rem.guilds.fetch('773660297696772096');
		const channels = await server.channels.fetch();
		const textChannels = channels.filter(channel => channel.type === 'GUILD_TEXT');
		res.send({ channels: textChannels });
	});

	app.get('/events', (req, res, next) => {
		const headers = {
			'Content-Type': 'text/event-stream',
			'Connection': 'keep-alive',
			'Cache-Control': 'no-cache'
		};
		res.writeHead(200, headers);
	
		const data = `data: ${JSON.stringify(tictactoe)}\n\n`;
		res.write(data);

		const clientId = Date.now();
		const newClient = {
			id: clientId,
			res
		};
		clients.push(newClient);

		req.on('close', () => {
			console.log('Connection closed');
			clients = clients.filter(client => client.id !== clientId);
		});
	});

	// remDB.forEach((tableObj, tableName) => {
	// 	app.get(`/${tableName}`, (req, res) => {
	// 		res.send(tableObj);
	// 	});
	// });

	app.post('/login', (req, res) => {
		if (req.body.nickname.toLowerCase() === 'admin') {
			res.sendStatus(200);
			return;
		}
		
		if (req.body.reqType === 'N') { // nickname request
			const nickname = req.body.nickname.toLowerCase();
			const member = server.members.cache.find(member => member?.nickname?.toLowerCase() === nickname);
			if (!member) {
				res.sendStatus(404);
			} else {
				const randomCode = (Math.floor(Math.random() * (1000000 - 100000) + 100000)).toString();
				member.send(randomCode);
				memberCodes.set(nickname, randomCode);
				res.sendStatus(202);
			}
		} else { // code request
			const recievedCode = req.body.code;
			const correctCode = memberCodes.get(req.body.nickname.toLowerCase());
			recievedCode === correctCode ? res.sendStatus(200) : res.sendStatus(401);
		}
	});

	app.post('/receipt', (req, res) => {
		clientFunctions.processReceipt(req.body);
		res.redirect('/');
	});

	app.post('/message', (req, res) => {
		clientFunctions.remMessage(req.body);
		res.send({ result: 'good?' });
	});

	app.post('/ttt', (req, res) => {
		const squareClicked = req.body.clicked;
		const marker = req.body.marker;
		tictactoe[squareClicked] = marker;
		clients.forEach(client => client.res.write(`data: ${JSON.stringify(tictactoe)}\n\n`));
		res.sendStatus(200);
	});

	app.post('/ttt-reset', (req, res) => {
		tictactoe.fill('.');
		clients.forEach(client => client.res.write(`data: ${JSON.stringify(tictactoe)}\n\n`));
		res.sendStatus(200);
	});
}

module.exports = {
	setupServer
};