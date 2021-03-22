"use strict";

const db = require("../db");
const { BadRequestError } = require("../expressError");
const ProductWon = require("./ProductWonModel");


/** Related functions for products. */

class Product {
  // Grabs products (along with each bidder's information) based on search query passed in.
  // Utilizes pagination with a max of 24 in each query. 
  static async getProducts(q) {
    let query = `SELECT products.id,
                        products.name,
                        products.category,
                        products.sub_category AS "subCategory",
                        products.description,
                        products.condition,
                        products.rating,
                        products.num_of_ratings AS "numOfRatings",
                        products.image_url AS "imageUrl",
                        products.starting_bid AS "startingBid",
                        products.auction_end_dt AS "auctionEndDt",
                        products.bid_count AS "bidCount",
                        products.auction_ended AS "auctionEnded",
                        users.email AS "bidderEmail",
                        users.first_name AS "bidderFirstName",
                        users.last_name AS "bidderLastName",
                        users.username AS "bidderUsername",
                        highest_bids.bid_price AS "bidPrice"
                FROM products
                FULL OUTER JOIN highest_bids ON products.id = highest_bids.product_id
                FULL OUTER JOIN users ON highest_bids.user_email = users.email`;

    // whereExpressions, queryValues, and paginationQuery will be inserted into query
    let whereExpressions = [];
    let queryValues = []; 
    let paginationQuery = " limit 24 OFFSET ";

    let { page, name, category, subCategory, description, condition, 
      rating, numOfRatings, auctionEndDt} = q;
    let numberOfProductsPerPage = 24

    // Number to be placed in the OFFSET portion of query to 
    // determine the correct products a user should see.
    let offsetNumber;

    // If page is not defined in query, set offset number to zero.
    if (!page) {
      offsetNumber = 0
    }
    else {
      // Otherwise set page to integer and determine how many 
      // products user has seen to offset query.
      let pageNum = parseInt(page)
      offsetNumber = (pageNum - 1) * numberOfProductsPerPage
    }

    paginationQuery += offsetNumber

    // For each possible search term, add to whereExpressions and queryValues to grab desired products.
    if (name !== undefined) {
      queryValues.push(`%${name}%`);
      whereExpressions.push(`name ILIKE $${queryValues.length}`);
    }

    if (category !== undefined) {
      queryValues.push(`%${category}%`);
      whereExpressions.push(`category ILIKE $${queryValues.length}`);
    }

    if (subCategory !== undefined) {
      queryValues.push(`%${subCategory}%`);
      whereExpressions.push(`sub_category ILIKE $${queryValues.length}`);
    }

    if (description !== undefined) {
      queryValues.push(description);
      whereExpressions.push(`description ILIKE $${queryValues.length}`);
    }

    if (condition !== undefined) {
      queryValues.push(condition);
      whereExpressions.push(`condition = $${queryValues.length}`);
    }

    if (rating !== undefined) {
      queryValues.push(rating);
      whereExpressions.push(`rating >= $${queryValues.length}`);
    }

    if (numOfRatings !== undefined) {
      queryValues.push(numOfRatings);
      whereExpressions.push(`num_of_ratings >= $${queryValues.length}`);
    }

    if (auctionEndDt !== undefined) {
      queryValues.push(auctionEndDt);
      whereExpressions.push(`auction_end_dt >= $${queryValues.length}`);
    }


    whereExpressions.push(`auction_ended = false`);
    query += " WHERE " + whereExpressions.join(" AND ");

    const allProductsResult = await db.query(query, queryValues);

    if(!allProductsResult) {
      throw new BadRequestError(`Unable to make request for all products in Products.getProducts()`);
    }

    // total number of products. To be used on frontend to disable/enable 
    // next and previous page buttons
    let numOfProducts = allProductsResult.rows.length
    console.log("numOfProducts",numOfProducts)

    let numOfAuctionsEnded = 0;
    const currentDateTime = Date.parse(new Date());
    for ( const p of allProductsResult.rows) {
      const endDt = new Date(p.auctionEndDt)
      if ((currentDateTime - Date.parse(endDt)) > 0){
        if(p.bidderEmail) {
          ProductWon.wonProduct(p.id, p.name, p.bidderEmail, p.bidPrice)
        } else {
          Product.auctionEnded(p.id)
        }
        numOfAuctionsEnded += 1

      } 
    }

    // get new total number of products in which their auctions have not ended by 
    // subtracting the number of auctions ended from the total numOfProducts
    numOfProducts = numOfProducts - numOfAuctionsEnded
    console.log("numOfProducts",numOfProducts)


    const queryWithPagination = query + paginationQuery
    const paginatedProductsResult = await db.query(queryWithPagination, queryValues);

    if(!paginatedProductsResult) {
      throw new BadRequestError(`Unable to make request for products in Products.getProducts()`);
    }

    // Create object containing the products and the number of total products 
    const productsAndCount = {
      products: paginatedProductsResult.rows,
      count: numOfProducts
    }
    return productsAndCount;
  }

  /** Given a product id, return data about product and its bidder.
   *
   * Throws NotFoundError if not found.
   **/

  static async getProductAndBid(id) {
    const productRes = await db.query( 
    `SELECT products.id,
            products.name,
            products.category,
            products.sub_category AS "subCategory",
            products.description,
            products.condition,
            products.rating,
            products.num_of_ratings AS "numOfRatings",
            products.image_url AS "imageUrl",
            products.starting_bid AS "startingBid",
            products.auction_end_dt AS "auctionEndDt",
            products.bid_count AS "bidCount",
            products.auction_ended AS "auctionEnded",
            highest_bids.user_email AS "bidderEmail",
            highest_bids.bid_price AS "bidPrice",
            users.username AS "bidderUsername"
    FROM products
    FULL OUTER JOIN highest_bids ON products.id = highest_bids.product_id
    FULL OUTER JOIN users ON highest_bids.user_email = users.email
    WHERE id = $1`,
        [id]);

    if (!productRes) throw new BadRequestError(`Unable to get product`);
    
    const product = productRes.rows[0]
    const currentDateTime = Date.parse(new Date());
    const endDt = new Date(product.auctionEndDt)

    // If the auction end time has passed, add to the products_won table if product has a bid.
    // If no bid, just set the auction_ended to true
    if ((Date.parse(endDt) - currentDateTime) < 0){
        if(product.bidderEmail) {
          ProductWon.wonProduct(product.id, product.Name, product.bidderEmail, product.bidPrice)
        } else {
          Product.auctionEnded(product.id)
        }
    } 
    return product;
  }

  // Change auction_ended column of a product to true
  static async auctionEnded(productId) {
    const auctionEndedResult = await db.query(
      `UPDATE products 
        SET auction_ended = true
        WHERE id = $1`,[productId]);

    if (!auctionEndedResult) throw new BadRequestError(`productauctionEnded boolean value unchanged ${auctionEndedResult}`);
  }

  // Get products with the highest bids
  static async getWhatsTrending() {
    const endingSoonResult = await db.query(
      `SELECT products.id,
              products.name,
              products.category,
              products.sub_category AS "subCategory",
              products.description,
              products.condition,
              products.rating,
              products.num_of_ratings AS "numOfRatings",
              products.image_url AS "imageUrl",
              products.starting_bid AS "startingBid",
              products.auction_end_dt AS "auctionEndDt",
              products.bid_count AS "bidCount",
              products.auction_ended AS "auctionEnded",
              users.email AS "bidderEmail",
              users.first_name AS "bidderFirstName",
              users.last_name AS "bidderLastName",
              users.username AS "bidderUsername",
              highest_bids.bid_price AS "bidPrice"
        FROM products
        FULL OUTER JOIN highest_bids ON products.id = highest_bids.product_id
        FULL OUTER JOIN users ON highest_bids.user_email = users.email
        WHERE products.auction_ended = false
        ORDER BY products.bid_count DESC
        LIMIT 4`
    )
    if (!endingSoonResult) throw new BadRequestError(`unable to grab latest highest bids`);

    return endingSoonResult.rows
  }

  // Grab all products that auction has not ended and have a bid. If any grabbed 
  // product's auction ended datetime has passed, set the auction_ended value to true.
  static async checkProductsForAuctionEnded() {
    const result = await db.query(
      `SELECT products.id,
              products.name,
              products.category,
              products.sub_category AS "subCategory",
              products.description,
              products.condition,
              products.rating,
              products.num_of_ratings AS "numOfRatings",
              products.image_url AS "imageUrl",
              products.starting_bid AS "startingBid",
              products.auction_end_dt AS "auctionEndDt",
              products.bid_count AS "bidCount",
              products.auction_ended AS "auctionEnded",
              users.email AS "bidderEmail",
              users.first_name AS "bidderFirstName",
              users.last_name AS "bidderLastName",
              users.username AS "bidderUsername",
              highest_bids.bid_price AS "bidPrice"
      FROM products
      FULL OUTER JOIN highest_bids ON products.id = highest_bids.product_id
      FULL OUTER JOIN users ON highest_bids.user_email = users.email
      WHERE auction_ended=false 
      AND bid_count > 0`
    );

    const currentDateTime = Date.parse(new Date())

    // for each product grabbed, if product has bidder, execute the wonProduct method.
    // Otherwise, set the product's auction_ended column to true
    for ( const p of result.rows) {
      const endDt = new Date(p.auctionEndDt)
      if ((currentDateTime - Date.parse(endDt)) > 0){
        if(p.bidderEmail) {
          ProductWon.wonProduct(p.id, p.name, p.bidderEmail, p.bidPrice)
        } else {
          Product.auctionEnded(p.id)
        }
      }
    }
    return result.rows
  }
}

module.exports = Product;