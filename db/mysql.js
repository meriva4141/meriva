const mysql = require('mysql'); // ← mysql2 yerine mysql

const pool = mysql.createPool({
  host: "static.155.95.217.95.clients.your-server.de",
  user: "haxball",
  password: "Can5265630+",
  database: "haxball"
});

module.exports = pool;