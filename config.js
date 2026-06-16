"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
require("colors");

const SECRET_KEY = "secret-key333";

const PORT = process.env.PORT || 3001;
const MONGODB_URI =
  process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/freebay";
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const MERCHANT_WALLET_ADDRESS = process.env.MERCHANT_WALLET_ADDRESS;

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("freebay Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("MongoDB:".yellow, MONGODB_URI);
console.log("SOLANA_RPC_URL:".yellow, SOLANA_RPC_URL);
console.log("MERCHANT_WALLET_ADDRESS:".yellow, MERCHANT_WALLET_ADDRESS || "(not set)");
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  MONGODB_URI,
  SOLANA_RPC_URL,
  MERCHANT_WALLET_ADDRESS,
};
