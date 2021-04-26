"use strict";

const products1 = require("./products_1");
const products2 = require("./products_2");
const products3 = require("./products_3");

const ProductWon = require("./models/ProductWonModel")
const Bid = require("./models/BidModel")

// Seed file to add all products to database. 

const db = require("./db");


class FreebaySeed{

  static randomDate(start, end) {
    let currentDateTime = new Date()
    // number of milliseconds from now to the latest time of the auction
    let limit = 9000000000
    return new Date(currentDateTime.getTime() + Math.random() * (limit));
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

FreebaySeed.seedAllProducts()
// FreebaySeed.seedSampleUsers()


module.exports = FreebaySeed;


