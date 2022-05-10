function connectJawsDB() {
  const mysql = require('mysql2');
  const connection = mysql.createConnection(process.env.sqlURL);
  connection.connect();
}

module.exports = {
  connectJawsDB
};