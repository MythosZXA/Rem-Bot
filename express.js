// express
const express = require('express');
const app = express();
app.listen(process.env.PORT);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./Client'));

const clientFunctions = require('./Functions/clientFunctions');

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
		clientFunctions.processReceipt(req.body);
		res.redirect('/');
	})
}

module.exports = {
	setupServer
};