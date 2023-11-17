const { setupCardSocket } = require('./Sockets/card');

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
const crypto = require('crypto');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {});
httpServer.listen(process.env.PORT);
// app.listen(process.env.PORT);
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

	app.get('/palia', (req, res) => {
		// Get villager info
		const villagers = rem.remDB.get('palia_villagers');
		// Get user's palia info
		const userID = req.cookies.discordID;
		const giftInfo = rem.remDB.get('palia_gifts').filter(giftInfo => giftInfo.user_id === userID);
		// Create default palia info if user had none
		if (!giftInfo.length) {
			villagers.forEach(villager => {
				giftInfo.push({
					user_id: userID,
					villager_id: villager.id,
					gifted: 0,
					gift1: 0,
					gift2: 0,
					gift3: 0,
					gift4: 0
				});
			});

			// Add default info to DB
			rem.remDB.get('palia_gifts').push(...giftInfo);
		}

		res.send({ villagers: villagers, giftInfo: giftInfo });
	});

	app.post('/palia-update', (req, res) => {
		// Parse data from request
		const userID = req.cookies.discordID;
		const villagerID = req.body.villagerID;
		const giftNumber = req.body.giftNumber;

		// Update DB
		const giftInfo = rem.remDB.get('palia_gifts').find(giftInfo => giftInfo.user_id === userID && giftInfo.villager_id === villagerID);
		if (giftInfo) {
			switch (giftNumber) {
				case 0:
					giftInfo['gifted'] = giftInfo['gifted'] === 1 ? 0 : 1;
					break;
				case 1:
				case 2:
				case 3:
				case 4:
					giftInfo[`gift${giftNumber}`] = giftInfo[`gift${giftNumber}`] === 1 ? 0 : 1;
					break;
			}
			res.sendStatus(200);
		} else {
			res.sendStatus(400);
		}
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
				} else if (!member) {
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
				.cookie('discordID', member.id, {
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
		res.sendStatus(200);
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

function setupSocket() {
	io.on('connection', (socket) => {
		const cookies = cookie.parse(socket.handshake.headers.cookie);
		console.log(`${cookies.nickname} connected`);

		socket.on('disconnect', () => {
			console.log(`${cookies.nickname} disconnected`)
		});
	});
}

module.exports = {
	setupServer,
	setupSocket
};