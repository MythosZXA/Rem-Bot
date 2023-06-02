// express
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
app.listen(process.env.PORT);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./src'));
app.use(cookieParser());

const clientFunctions = require('./Functions/clientFunctions');
const session = new Map();
const admins = new Set();
let clients = [];
let tictactoe = ['.','.','.','.','.','.','.','.','.'];

async function setupServer(rem) {
	const server = await rem.guilds.fetch('773660297696772096');

	app.get('/', (req, res) => {
		res.sendFile(__dirname + '/src/index.html');
	});

	app.get('/portfolio', (req, res) => {
		res.sendFile(__dirname + '/src/Portfolio/portfolio.html');
	})

	app.get('/textChannels', async (req, res) => {
		const server = await rem.guilds.fetch('773660297696772096');
		const channels = await server.channels.fetch();
		const textChannels = channels.filter(channel => channel.type === 'GUILD_TEXT');
		res.send({ channels: textChannels });
	});

	app.get('/serverMembers', async (req, res) => {
		const server = await rem.guilds.fetch('773660297696772096');
		const members = server.members.cache;
		const realMembers = members.filter(member => !member.user.bot);
		res.send({ members: realMembers });
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

	app.post('/login', (req, res) => {
		switch (req.body.reqType) {
			case 'S': // Session restore request
				const sessionID = req.cookies.sessionID;
				const nickname = session.get(sessionID);
				if (!nickname) {
					res.sendStatus(401);
					return;
				}

				const member = server.members.cache.find(member => member?.nickname?.toLowerCase() === nickname);
				const avatarURL = member.displayAvatarURL();
				res.send({ avatarURL: avatarURL });
				break;
			case 'N': { // Nickname request
				const nickname = req.body.input.toLowerCase();
				const member = server.members.cache.find(member => member?.nickname?.toLowerCase() === nickname);

				if (nickname === 'remadmin') {
					const sessionID = crypto.randomUUID();
					admins.add(sessionID);
					res.cookie('sessionID', sessionID, {
						secure: true,
						httpOnly: true,
						sameSite: 'strict'
					})
					.send({ avatarURL: rem.user.avatarURL() });
					return;
				}
				if (!member) {
					res.sendStatus(404);
					return;
				}

				const randomPin = Math.floor(Math.random() * (1000000 - 100000) + 100000).toString();
				session.set(nickname, randomPin);
				member.send(randomPin);
				res.cookie('nickname', nickname, {
					secure: true, // Http(s)
					httpOnly: true, // Client JS code can't access
					sameSite: 'strict' // Same port
				})
				.sendStatus(202);
				break;
			}
			case 'C': { // Code request
				const nickname = req.cookies.nickname.toLowerCase();
				const recievedPin = req.body.input;
				const correctPin = session.get(nickname);

				if (recievedPin !== correctPin) {
					res.sendStatus(401);
					return;
				}

				const member = server.members.cache.find(member => member?.nickname?.toLowerCase() === nickname);
				const avatarURL = member.displayAvatarURL();
				const sessionID = crypto.randomUUID();
				session.delete(nickname);
				session.set(sessionID, nickname);
				res.cookie('sessionID', sessionID, {
					secure: true,
					httpOnly: true,
					sameSite: 'strict'
				})
				.send({ avatarURL: avatarURL });
				break;
			}
			default:
				break;
		}

		// req.on('close', () => {
		// 	console.log('Connection closed');
		// 	session.delete(req.cookies.sessionID);
		// });
	});

	app.post('/logout', (req, res) => {
		session.delete(req.cookies.sessionID);
		admins.delete(req.cookies.sessionID);
		res.sendStatus(200);
	});

	app.post('/receipt', (req, res) => {
		clientFunctions.processReceipt(req.body);
		res.redirect('/');
	});

	app.post('/messageHistory', async (req, res) => {
		if (!admins.has(req.cookies.sessionID)) {
			res.sendStatus(401);
			return;
		}

		const server = await rem.guilds.fetch('773660297696772096');
		const chatName = req.body.chatName;
		const serverMember = server.members.cache.find(member => 
			member.nickname === chatName);
		const dmChannel = await serverMember.user.createDM();
		const messageHistory = await dmChannel.messages.fetch({ limit: 10 });
		const arr = [];
		messageHistory.forEach(message => {
			arr.push([message.author.bot, message.content]);
		});
		res.send(arr);
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