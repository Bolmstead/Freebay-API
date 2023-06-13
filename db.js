const { Client } = require("pg");

// console.log("process.env.DATABASE_URL", process.env.DATABASE_URL);

const db = new Client({
  connectionString: process.env.HEROKU_DATABASE_URL,
  password: process.env.HEROKU_DATABASE_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

db.connect();

module.exports = db;
