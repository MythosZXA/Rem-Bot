const express = require('express');
const app = express();
app.listen(process.env.PORT);

function setupServer(remDB) {
	remDB.forEach((tableObj, tableName) => {
		app.get(`/${tableName}`, (req, res) => {
			res.send(tableObj);
		});
	});
}

module.exports = {
	setupServer
};