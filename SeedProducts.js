"use strict";
const db = require("./db");

const products1 = require("./products_1");
const products2 = require("./products_2");
const products3 = require("./products_3");

const ProductWon = require("./models/ProductWonModel");
const Bid = require("./models/BidModel");

// Seed file to delete all tables and add all products to database.

class FreebaySeed {
  static async createTables() {
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
        notification_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
  }

  static randomDate(start, end) {
    let currentDateTime = new Date();
    // 1 monthish
    return new Date(currentDateTime.getTime() + Math.random() * 3000000000);
  }

  static randomRating() {
    return Math.floor(Math.random() * 4) + 2;
  }

  static randomNumberOfRatings() {
    return Math.floor(Math.random() * 1111);
  }

  /** Method to seed all products into database */
  static async seedAllProducts() {
    for (let i = 0; i < products1.length; i++) {
      const {
        item,
        category,
        sub_category,
        description,
        image_1,
        market_price,
      } = products1[i];

      // Create Random DateTime object
      let auction_end_dt = FreebaySeed.randomDate(
        new Date(2021, 3, 25),
        new Date()
      );
      console.log(
        "🚀 ~ file: SeedTablesAndProducts.js ~ line 100 ~ FreebaySeed ~ seedAllProducts ~ auction_end_dt",
        auction_end_dt
      );

      // Create starting price as 2/3 of the product's actual price
      let starting_bid = Math.round(market_price * 0.66);
      starting_bid = Math.round(100 * starting_bid) / 100;
      console.log(
        "🚀 ~ file: SeedTablesAndProducts.js ~ line 105 ~ FreebaySeed ~ seedAllProducts ~ starting_bid",
        starting_bid
      );
      if (!starting_bid) {
        starting_bid = 5;
      }

      // Grab random rating, number of ratings
      const num_of_ratings = FreebaySeed.randomNumberOfRatings();
      console.log(
        "🚀 ~ file: SeedTablesAndProducts.js ~ line 110 ~ FreebaySeed ~ seedAllProducts ~ num_of_ratings",
        num_of_ratings
      );
      const rating = FreebaySeed.randomRating();
      console.log(
        "🚀 ~ file: SeedTablesAndProducts.js ~ line 112 ~ FreebaySeed ~ seedAllProducts ~ rating",
        rating
      );

      const valuesArray = [
        item,
        category,
        sub_category,
        description,
        rating,
        num_of_ratings,
        image_1,
        starting_bid,
        auction_end_dt,
      ];

      await db.query(
        `INSERT INTO products (name, category, sub_category, description, rating, num_of_ratings, image_url, starting_bid, auction_end_dt) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        valuesArray
      );
    }

    for (let i = 0; i < products2.length; i++) {
      const {
        item,
        category,
        sub_category,
        description,
        image_1,
        market_price,
      } = products2[i];

      // Create Random DateTime object
      let auction_end_dt = FreebaySeed.randomDate(
        new Date(2021, 3, 25),
        new Date()
      );

      // Create starting price as half of the product's actual price
      let starting_bid = market_price * 0.5;
      starting_bid = Math.round(100 * starting_bid) / 100;

      if (!starting_bid) {
        starting_bid = 5;
      }

      // Grab random rating and number of ratings
      const num_of_ratings = FreebaySeed.randomNumberOfRatings();
      const rating = FreebaySeed.randomRating();

      const valuesArray = [
        item,
        category,
        sub_category,
        description,
        rating,
        num_of_ratings,
        image_1,
        starting_bid,
        auction_end_dt,
      ];

      console.log("🚀 ~ second loop ~ valuesArray", valuesArray);

      await db.query(
        `INSERT INTO products (name, category, sub_category, description, rating, num_of_ratings, image_url, starting_bid, auction_end_dt) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        valuesArray
      );
    }

    for (let i = 0; i < products3.length; i++) {
      const {
        item,
        category,
        sub_category,
        description,
        image_1,
        market_price,
      } = products3[i];

      // Create Random DateTime object
      let auction_end_dt = FreebaySeed.randomDate(
        new Date(2021, 3, 25),
        new Date()
      );

      // Create starting price as half of the product's actual price
      let starting_bid = market_price * 0.5;
      starting_bid = Math.round(100 * starting_bid) / 100;
      if (!starting_bid) {
        starting_bid = 5;
      }

      // Grab random rating and number of ratings
      const num_of_ratings = FreebaySeed.randomNumberOfRatings();
      const rating = FreebaySeed.randomRating();

      const valuesArray = [
        item,
        category,
        sub_category,
        description,
        rating,
        num_of_ratings,
        image_1,
        starting_bid,
        auction_end_dt,
      ];

      console.log("🚀 ~ 3rd loop valuesArray", valuesArray);

      await db.query(
        `INSERT INTO products (name, category, sub_category, description, rating, num_of_ratings, image_url, starting_bid, auction_end_dt) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        valuesArray
      );
    }

    console.log("made it through the loops!");
  }
}

// FreebaySeed.createTables();
// FreebaySeed.seedAllProducts();
// FreebaySeed.seedSampleUsers()

module.exports = FreebaySeed;
