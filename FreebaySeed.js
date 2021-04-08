"use strict";

const products1 = require("./products_1");
const products2 = require("./products_2");
const products3 = require("./products_3");

const User = require("./models/UserModel")
const ProductWon = require("./models/ProductWonModel")
const Bid = require("./models/BidModel")



const db = require("./db");


class FreebaySeed{

  static async createTables() {(
    await db.query(`DROP TABLE IF EXISTS products, users, products_won, bids, notifications;

      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(1000) NOT NULL,
        category VARCHAR(100) NOT NULL,
        sub_category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        rating DECIMAL NOT NULL CHECK (rating <= 5.0),
        num_of_ratings INTEGER NOT NULL,
        image_url VARCHAR(2083) NOT NULL,
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
        image_url VARCHAR(2083) NOT NULL,
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
      )`
  ))}

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
  static async seedAllProducts() {
    

    for (let i = 0; i < products1.length; i++) {

      const {item, category, sub_category, description, image_1, market_price} = products1[i]

      // Create Random DateTime object
      let auction_end_dt = FreebaySeed.randomDate(new Date(2021, 3, 25), new Date())

      // Create starting price as 2/3 of the product's actual price
      let starting_bid = Math.round(market_price * .66)
      starting_bid = Math.round(100*starting_bid)/100


      // Grab random rating, number of ratings
      const num_of_ratings = FreebaySeed.randomNumberOfRatings()
      const rating = FreebaySeed.randomRating()

      const valuesArray =
        [item, category, sub_category, description, rating, num_of_ratings, image_1, starting_bid, auction_end_dt]

      await db.query(`INSERT INTO products (name, category, sub_category, description, rating, num_of_ratings, image_url, starting_bid, auction_end_dt) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, valuesArray)
      }
    
    for (let i = 0; i < products2.length; i++) {
      const {item, category, sub_category, description, image_1, market_price} = products2[i]

      // Create Random DateTime object
      let auction_end_dt = FreebaySeed.randomDate(new Date(2021, 3, 25), new Date())

      // Create starting price as half of the product's actual price
      let starting_bid = market_price * .5
      starting_bid = Math.round(100*starting_bid)/100

      // Grab random rating and number of ratings
      const num_of_ratings = FreebaySeed.randomNumberOfRatings()
      const rating = FreebaySeed.randomRating()

      const valuesArray =
        [item, category, sub_category, description, rating, num_of_ratings, image_1, starting_bid, auction_end_dt]

      await db.query(`INSERT INTO products (name, category, sub_category, description, rating, num_of_ratings, image_url, starting_bid, auction_end_dt) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, valuesArray)
      }

    for (let i = 0; i < products3.length; i++) {
      const {item, category, sub_category, description, image_1, market_price} = products3[i]

      // Create Random DateTime object
      let auction_end_dt = FreebaySeed.randomDate(new Date(2021, 3, 25), new Date())

      // Create starting price as half of the product's actual price
      let starting_bid = market_price * .5
      starting_bid = Math.round(100*starting_bid)/100

      // Grab random rating and number of ratings
      const num_of_ratings = FreebaySeed.randomNumberOfRatings()
      const rating = FreebaySeed.randomRating()

      const valuesArray =
        [item, category, sub_category, description, rating, num_of_ratings, image_1, starting_bid, auction_end_dt]

      await db.query(`INSERT INTO products (name, category, sub_category, description, rating, num_of_ratings, image_url, starting_bid, auction_end_dt) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, valuesArray)
      }
    }

  static async seedSampleUsers() {

    let userObject1 = {
      email:  "santa@claus.com",
      username: "Santa Claus",
      password: "password",
      firstName: "Kris",
      lastName: "Kringle",
      imageUrl: "https://ec.europa.eu/jrc/sites/jrcsh/files/styles/normal-responsive/public/adobestock_226013143.jpeg?itok=3dbnMDO6",
      balance: 1000
      }

    let userObject2 = {
      email:  "NickCage@gmail.com",
      username: "NiCkCaGe123",
      password: "password",
      firstName: "Nicholas",
      lastName: "Cage",
      imageUrl: "https://s3-us-west-2.amazonaws.com/flx-editorial-wordpress/wp-content/uploads/2018/02/27181649/Nicolas-Cage-FFF.jpg",
      balance: 1000
      }

    let userObject3 = {
      email:  "MikeTyson@gmail.com",
      username: "IRON M!KE",
      password: "password",
      firstName: "Mike",
      lastName: "Tyson",
      imageUrl: "https://s.abcnews.com/images/Sports/mike-tyson-show-gty-jt-200723_1595524132347_hpEmbed_3x2_992.jpg",
      balance: 1000
      }
      
    const user1Result = await db.query(
      `INSERT INTO users
       (email, username, password, first_name, last_name, image_url, balance)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING email, username, password, first_name AS firstName, last_name AS lastName, image_url AS imageUrl, balance`,
      [
        userObject1.email,
        userObject1.username,
        userObject1.password,
        userObject1.firstName,
        userObject1.lastName,
        userObject1.imageUrl,
        userObject1.balance
      ]
    );

    const user2Result = await db.query(
      `INSERT INTO users
       (email, username, password, first_name, last_name, image_url, balance)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING email, username, password, first_name AS firstName, last_name AS lastName, image_url AS imageUrl, balance`,
      [
        userObject2.email,
        userObject2.username,
        userObject2.password,
        userObject2.firstName,
        userObject2.lastName,
        userObject2.imageUrl,
        userObject2.balance
      ]
    );

    const user3Result = await db.query(
      `INSERT INTO users
       (email, username, password, first_name, last_name, image_url, balance)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING email, username, password, first_name AS firstName, last_name AS lastName, image_url AS imageUrl, balance`,
      [
        userObject3.email,
        userObject3.username,
        userObject3.password,
        userObject3.firstName,
        userObject3.lastName,
        userObject3.imageUrl,
        userObject3.balance
      ]
    );

    const user1 = user1Result.rows[0]
    const user2 = user2Result.rows[0]
    const user3 = user3Result.rows[0]


    console.log("user1", user1)

      /// This part is not working
    await ProductWon.newWin(533, user1.email, 30)
    await ProductWon.newWin(254, user2.email, 35)
    await ProductWon.newWin(702, user3.email, 7)

    await Bid.addBid(332, user2.email, 80);
    await Bid.addBid(481, user1.email, 8);
    await Bid.addBid(856, user3.email, 15);
    await Bid.addBid(917, user2.email, 3);
    
  }
}

FreebaySeed.createTables()
FreebaySeed.seedAllProducts()
// FreebaySeed.seedSampleUsers()


module.exports = FreebaySeed;


