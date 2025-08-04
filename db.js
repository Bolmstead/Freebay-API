const { Client } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  password: process.env.HEROKU_DATABASE_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

db.connect();

module.exports = db;
