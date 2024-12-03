const { Client } = require("pg");
require("dotenv").config();

console.log("process.env.DATABASE_URL", process.env.DATABASE_URL);
console.log(
  "process.env.HEROKU_DATABASE_PASSWORD",
  process.env.HEROKU_DATABASE_PASSWORD
);

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  password: process.env.HEROKU_DATABASE_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

db.connect();

module.exports = db;
