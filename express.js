// express
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
const fs = require('fs');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {});
httpServer.listen(process.env.PORT);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./src'));
app.use(cookieParser());

const expressGlobal = {
	sessions: new Map(),
	admins: new Set()
};

async function setupServer(rem) {
	app.get('/', (req, res) => {
		res.sendFile(__dirname + '/src/index.html');
	});

	// Loop through all endpoint files and set them up
	const endpoints = fs.readdirSync('./Endpoints').filter(file => file.endsWith('.js'));
	for (const fileName of endpoints) {
		const endpoint = require(`./Endpoints/${fileName}`);
		app[endpoint.type](endpoint.name, (req, res) => endpoint.execute(req, res, rem, expressGlobal));
	}
}

function setupSocket(rem) {
	io.on('connection', (socket) => {
		const cookies = cookie.parse(socket.handshake.headers.cookie);
		console.log(`${cookies.nickname} connected`);

		socket.on('disconnect', () => {
			console.log(`${cookies.nickname} disconnected`);
		})
	});
}

module.exports = {
	setupServer,
	setupSocket
};