
const crypto = require('crypto');

function restoreSession(req, res, expressGlobal, server) {
	const sessionID = req.cookies.sessionID;
	const nickname = expressGlobal.sessions.get(sessionID);
	if (nickname) {
		const member = server.members.cache.find(member => member.nickname?.toLowerCase() === nickname);
		const avatarURL = member.displayAvatarURL();
		res.send({ avatarURL: avatarURL });
	} else {
		res.sendStatus(401);
	}
}

function findMember(req, res, rem, expressGlobal, server) {
	const nickname = req.body.input.toLowerCase();

	// Rem login
	if (nickname === 'remadmin') {
		const sessionID = crypto.randomUUID();
		expressGlobal.admins.add(sessionID);
		res.cookie('sessionID', sessionID, {
			secure: true,
			httpOnly: true,
			sameSite: 'strict'
		})
		.send({ avatarURL: rem.user.avatarURL() });
		return;
	}

	// Member login
	const member = server.members.cache.find(member => member.nickname?.toLowerCase() === nickname);
	if (member) {
		const randomPin = Math.floor(Math.random() * (1000000 - 100000) + 100000).toString();
		expressGlobal.sessions.set(nickname, randomPin);
		member.send(randomPin);
		res.cookie('nickname', nickname, {
			secure: true, // Http(s)
			httpOnly: true, // Client JS code can't access
			sameSite: 'strict' // Same port
		})
		.sendStatus(202);
	} else {
		res.sendStatus(404);
	}
}

function validateCode(req, res, expressGlobal, server) {
	const nickname = req.cookies.nickname.toLowerCase();
	const recievedPin = req.body.input;
	const correctPin = expressGlobal.sessions.get(nickname);

	if (recievedPin === correctPin) {
		const member = server.members.cache.find(member => member.nickname?.toLowerCase() === nickname);
		const avatarURL = member.displayAvatarURL();
		const sessionID = crypto.randomUUID();
		expressGlobal.sessions.delete(nickname);
		expressGlobal.sessions.set(sessionID, nickname);
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
	} else {
		res.sendStatus(401);
	}
}

module.exports = {
	name: '/login',
	type: 'post',
	async execute(req, res, rem, expressGlobal) {
		const server = await rem.guilds.fetch('773660297696772096');
		switch (req.body.reqType) {
			case 'S': // Session restore request
				restoreSession(req, res, expressGlobal, server);
				break;
			case 'N': // Nickname request
				findMember(req, res, rem, expressGlobal, server);
				break;
			case 'C': // Code request
				validateCode(req, res, expressGlobal, server);
				break;
			default:
				break;
		}
	}
};