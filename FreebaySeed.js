"use strict";

const products1 = require("./products_1");
const products2 = require("./products_2");
const products3 = require("./products_3");

const db = require("./db");


class SeedProducts{

  static async createTables() {
    await db.query(`DROP TABLE IF EXISTS products, users, products_won, highest_bids, notifications;

    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(1000) NOT NULL,
      category VARCHAR(100) NOT NULL,
      sub_category VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      condition VARCHAR(50) NOT NULL,
      rating DECIMAL NOT NULL CHECK (rating <= 5.0),
      num_of_ratings INTEGER NOT NULL,
      image_url VARCHAR(2083) NOT NULL,
      starting_bid DECIMAL NOT NULL,
      auction_end_dt TIMESTAMP NOT NULL,
      bid_count INTEGER NOT NULL DEFAULT 0,
      auction_ended BOOLEAN DEFAULT false
    );
    
    CREATE TABLE users (
      email varchar(50) PRIMARY KEY NOT NULL,
      username VARCHAR(30) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      balance DECIMAL NOT NULL,
      last_login TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    
    CREATE TABLE products_won (
      product_id INTEGER
        REFERENCES products(id) ON DELETE CASCADE,
      user_email VARCHAR(50)
        REFERENCES users(email) ON DELETE CASCADE,
      bid_price DECIMAL NOT NULL,
      datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE highest_bids (
      product_id INTEGER
        REFERENCES products(id) ON DELETE CASCADE,
      user_email VARCHAR(50)
        REFERENCES users(email) ON DELETE CASCADE,
      bid_price DECIMAL NOT NULL,
      datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE notifications (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(50)
        REFERENCES users(email) ON DELETE CASCADE,
      text TEXT,
      related_product_id INTEGER,
      was_viewed BOOLEAN DEFAULT false,
      category VARCHAR(50),
      datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)

  }
  static randomCondition(){
    const conditions = ["Brand New", "New - Open Box", "Good", "Used"]
    const condition = conditions[(Math.floor(Math.random() * 4))]
    return condition
  }

  static randomDate(start, end) {
    let currentDateTime = new Date()

    return new Date(currentDateTime.getTime() + Math.random() * (36400000));
  }

  static randomRating() {
    return ((Math.floor(Math.random() * 4))+2)
  }
  
  static randomNumberOfRatings() {
    return (Math.floor(Math.random() * 1111))
  }

  /** Method to seed all products into database */
  static async seed() {
    

    for (let i = 0; i < products1.length; i++) {

      const {item, category, sub_category, description, image_1, market_price} = products1[i]

      // Create Random DateTime object
      let auction_end_dt = SeedProducts.randomDate(new Date(2021, 3, 25), new Date())

      // Create starting price as 2/3 of the product's actual price
      let starting_bid = Math.round(market_price * .66)
      starting_bid = Math.round(100*starting_bid)/100


      // Grab random rating, number of ratings, and condition
      const num_of_ratings = SeedProducts.randomNumberOfRatings()
      const rating = SeedProducts.randomRating()
      const condition = SeedProducts.randomCondition()

      const valuesArray =
        [item, category, sub_category, description, condition, rating, num_of_ratings, image_1, starting_bid, auction_end_dt]

      await db.query(`INSERT INTO products (name, category, sub_category, description, condition, rating, num_of_ratings, image_url, starting_bid, auction_end_dt) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, valuesArray)
      }
    
    for (let i = 0; i < products2.length; i++) {
      const {item, category, sub_category, description, image_1, market_price} = products2[i]

      // Create Random DateTime object
      let auction_end_dt = SeedProducts.randomDate(new Date(2021, 3, 25), new Date())

      // Create starting price as half of the product's actual price
      let starting_bid = market_price * .5
      starting_bid = Math.round(100*starting_bid)/100

      // Grab random rating and number of ratings
      const num_of_ratings = SeedProducts.randomNumberOfRatings()
      const rating = SeedProducts.randomRating()
      const condition = SeedProducts.randomCondition()

      const valuesArray =
        [item, category, sub_category, description, condition, rating, num_of_ratings, image_1, starting_bid, auction_end_dt]

      await db.query(`INSERT INTO products (name, category, sub_category, description, condition, rating, num_of_ratings, image_url, starting_bid, auction_end_dt) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, valuesArray)
      }

    for (let i = 0; i < products3.length; i++) {
      const {item, category, sub_category, description, image_1, market_price} = products3[i]

      // Create Random DateTime object
      let auction_end_dt = SeedProducts.randomDate(new Date(2021, 3, 25), new Date())

      // Create starting price as half of the product's actual price
      let starting_bid = market_price * .5
      starting_bid = Math.round(100*starting_bid)/100

      // Grab random rating and number of ratings
      const num_of_ratings = SeedProducts.randomNumberOfRatings()
      const rating = SeedProducts.randomRating()
      const condition = SeedProducts.randomCondition()

      const valuesArray =
        [item, category, sub_category, description, condition, rating, num_of_ratings, image_1, starting_bid, auction_end_dt]

      await db.query(`INSERT INTO products (name, category, sub_category, description, condition, rating, num_of_ratings, image_url, starting_bid, auction_end_dt) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, valuesArray)
      }
    }
}

SeedProducts.createTables()
SeedProducts.seed()

module.exports = SeedProducts;


