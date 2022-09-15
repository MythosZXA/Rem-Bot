const express = require('express');
const app = express();
app.listen(process.env.PORT);
app.use(express.static('./Client'));

function setupServer(remDB) {
	app.get('/', (req, res) => {
		res.sendFile(__dirname + './Client/index.html');
	});

	remDB.forEach((tableObj, tableName) => {
		app.get(`/${tableName}`, (req, res) => {
			res.send(tableObj);
		});
	});
}

module.exports = {
	setupServer
};