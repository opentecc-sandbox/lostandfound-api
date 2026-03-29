const { Pool } = require("pg");
require("dotenv").config();
//pool is like a manager: whenever your backend needs to talk to the database, it asks the pool to get a connection.
const pool = new Pool({
  connectionString: process.env .DB_URL,
  ssl:{ rejectUnauthorized: false },
 
});

module.exports = pool;