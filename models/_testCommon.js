"use strict";

process.env.NODE_ENV = "test";

const db = require("../db.js");
const bcrypt = require("bcrypt");
const { createToken } = require("../helpers/tokens");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testProducts = [];
const testUsers = [];
const testTokens = [];

let tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)

async function commonBeforeAll() {
  // create tables 
  await db.query(`DROP TABLE IF EXISTS products, users, products_won, bids, notifications;

  CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(1000) NOT NULL,
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    rating DECIMAL NOT NULL CHECK (rating <= 5.0),
    num_of_ratings INTEGER NOT NULL,
    image_url VARCHAR(2083),
    starting_bid DECIMAL NOT NULL,
    auction_end_dt TIMESTAMP NOT NULL,
    auction_ended BOOLEAN DEFAULT false
  );
  
  CREATE TABLE users (
    email varchar(50) PRIMARY KEY NOT NULL,
    username VARCHAR(30) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    balance DECIMAL NOT NULL,
    image_url VARCHAR(2083),
    last_login TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE products_won (
    product_id INTEGER NOT NULL
      REFERENCES products(id) ON DELETE CASCADE,
    user_email VARCHAR(50) NOT NULL
      REFERENCES users(email) ON DELETE CASCADE,
    bid_price DECIMAL NOT NULL,
    won_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE bids (
    bid_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL
      REFERENCES products(id) ON DELETE CASCADE,
    user_email VARCHAR(50) NOT NULL
      REFERENCES users(email) ON DELETE CASCADE,
    bid_price DECIMAL NOT NULL,
    is_highest_bid BOOLEAN DEFAULT true,
    was_winning_bid BOOLEAN DEFAULT false,
    bid_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(50)
      REFERENCES users(email) ON DELETE CASCADE,
    text TEXT,
    related_product_id INTEGER,
    was_viewed BOOLEAN DEFAULT false,
    category VARCHAR(50),
    notification_time TIMESTAMP NOT NULL DEFAULT
    CURRENT_TIMESTAMP
  )`);

  const user1Result = await db.query(
    `INSERT INTO users
     (email, username, password, first_name, last_name, image_url, balance)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING email, username, password, first_name AS firstName, last_name AS lastName, image_url AS imageUrl, balance`,
    [
      "user1@email.com",
      "user1username",
      "user1password",
      "user1firstname",
      "user1lastname",
      "https://i.stack.imgur.com/l60Hf.png",
      1000
    ]
  );



  const user2Result = await db.query(
    `INSERT INTO users
     (email, username, password, first_name, last_name, image_url, balance)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING email, username, password, first_name AS firstName, last_name AS lastName, image_url AS imageUrl, balance`,
     [
      "user2@email.com",
      "user2username",
      "user2password",
      "user2firstname",
      "user2lastname",
      "https://i.stack.imgur.com/l60Hf.png",
      1000
    ]
  );


  const user1 = user1Result.rows[0]
  const user2 = user2Result.rows[0]

  console.log("user1,", user1)
  console.log("user2,", user2)


  testUsers[0] = user1;
  testUsers[1] = user2;

  const u1Token = createToken(user1);
  const u2Token = createToken(user2);

  testTokens[0] = u1Token;
  testTokens[1] = u2Token;

  console.log("u1Token,", u1Token)
  console.log("u2Token,", u2Token)


  const product1Result = await db.query(
    `INSERT INTO products (name, category, sub_category, description, rating, num_of_ratings, image_url, starting_bid, auction_end_dt) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING (name, category, sub_category AS subCategory, description, rating, numOfRatings, imageUrl, startingBid, auctionEndDt)`,
    [ "iPhone",
      "Electronics",
      "Cell Phones and Accessories",
      "Example description for iPhone",
      5,
      23,
      "https://images-na.ssl-images-amazon.com/images/I/71nK-Ti90%2BL._AC_SX522_.jpg",
      30,
      tomorrow
    ]
  );

  const product2Result = await db.query(
    `INSERT INTO products (name, category, sub_category, description, rating, num_of_ratings, image_url, starting_bid, auction_end_dt) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING (name, category, sub_category AS subCategory, description, rating, numOfRatings, imageUrl, startingBid, auctionEndDt)`,
    [ "Candy Bar",
      "Misc.",
      "Grocery",
      "Example description for Candy Bar",
      2,
      70,
      null,
      40,
      tomorrow
    ]
  );

  const product1 = product1Result.rows[0]
  const product2 = product2Result.rows[0]

  console.log("product1,", product1)
  console.log("product2,", product2)


  testProducts[0] = product1;
  testProducts[1] = product2;


}


async function commonAfterAll() {
  // delete any data created by test
  await db.query("DELETE FROM products, users");
  // close db connection
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonAfterAll,
  testProducts,
  testUsers,
  testTokens,
  tomorrow
};
