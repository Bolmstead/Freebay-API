"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const Notification = require("./NotificationModel");
const Product = require("./ProductModel");


/** Related functions for products_won. */

class ProductsWon {

  // Method to be executed when a user wins a product
  static async newWin(productId, userEmail, bidPrice){

    // Insert into products_won table 
    const productWonRes = await db.query(
    `INSERT INTO products_won (product_id, user_email, bid_price)
    VALUES ($1, $2, $3)
    RETURNING product_id AS "productId", user_email AS "userEmail", bid_price AS "bidPrice"`,
     [productId, userEmail, bidPrice]);

    if (!productWonRes) throw new NotFoundError(
      `Winning Product not added to Products Won table`
    );

  }

  // Method to grab the product and bidder information 
  // of products most recently won.
  static async getRecentWins(numOfProducts) {
    // Only query products that have a bid and the auction has ended
    const winsFeedRes = await db.query(
      `SELECT products.id,
              products.name,
              products.category,
              products.sub_category AS "subCategory",
              products.description,
              products.rating,
              products.image_url AS "imageUrl",
              products.auction_end_dt AS "auctionEndDt",
              products.auction_ended AS "auctionEnded",
              products_won.bid_price AS "bidPrice",
              products_won.won_time AS "wonTime",
              users.username,
              users.email,
              users.image_url AS "userImageUrl"
        FROM products_won
        FULL OUTER JOIN products ON products_won.product_id = products.id
        FULL OUTER JOIN users ON products_won.user_email = users.email
        WHERE products.auction_ended = true AND products_won.bid_price > 1
        ORDER BY products_won.won_time DESC
        LIMIT ${numOfProducts}`);

    if (!winsFeedRes) throw new BadRequestError(`Unable to getBids in userModel.js`);

    return winsFeedRes.rows
    }
}

module.exports = ProductsWon;
