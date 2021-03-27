"use strict";

const db = require("../db");
const { BadRequestError } = require("../expressError");
const ProductWon = require("./ProductWonModel");


/** Related functions for products. */

class Product {
  // Grabs products and their bidder info based on search query parameters.
  // Utilizes pagination with a max number of products in each query. 
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

    // whereExpressions, queryValues, and paginationQuery that will be inserted into query
    let whereExpressions = [];
    let queryValues = []; 
    let paginationQuery = " limit 24 OFFSET ";

    let { page, name, category, subCategory, description, condition, 
      rating, numOfRatings, auctionEndDt} = q;
    console.log("subCategory", subCategory)

    let numberOfProductsPerPage = 24

    // Number to be placed in the OFFSET portion of query.
    let offsetNumber;

    // If page is not defined in query, set offset number to zero.
    if (!page) {
      offsetNumber = 0
    }
    else {
      // Otherwise convert page to integer and determine how many 
      // products user has seen to offset query.
      let pageNum = parseInt(page)
      offsetNumber = (pageNum - 1) * numberOfProductsPerPage
    }

    paginationQuery += offsetNumber

    // For each possible search term, add to whereExpressions and 
    // queryValues to grab desired products.
    if (name !== undefined) {
      queryValues.push(`%${name}%`);
      whereExpressions.push(`name ILIKE $${queryValues.length}`);
    }

    if (category !== undefined) {
      queryValues.push(`%${category}%`);
      whereExpressions.push(`category ILIKE $${queryValues.length}`);
    }

    if (subCategory !== undefined) {
      queryValues.push(`${subCategory}%`);
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

    // add only products that are in auction to query along 
    // with the where expressions
    whereExpressions.push(`auction_ended = false`);
    query += " WHERE " + whereExpressions.join(" AND ");
    console.log("query", query)

    // Send query for ALL products (without pagination). Total amount of products
    // will be used in frontend in order to disable/endable next and previous page buttons
    const allProductsResult = await db.query(query, queryValues);
    if(!allProductsResult) {
      throw new BadRequestError(`Unable to make request for all products in Products.getProducts()`);
    }
    let numOfProducts = allProductsResult.rows.length

    // Loop through ALL products to determine if the product's auction has ended.
    // If so, run appropriate method.
    let numOfAuctionsEnded = 0;
    const currentDateTime = Date.parse(new Date());
    for ( const p of allProductsResult.rows) {
      const endDt = new Date(p.auctionEndDt)
      if ((currentDateTime - Date.parse(endDt)) > 0){
        // If a product has a bidder
        if(p.bidderEmail) {
          ProductWon.newWin(p.id, p.name, p.bidderEmail, p.bidPrice)
        } else {
          Product.auctionEnded(p.id)
        }
        // Number of auctions ended will be subtracted from the numOfProducts to get
        // the accurate number of total products still in auction
        numOfAuctionsEnded += 1

      } 
    }

    // get new total number of products in auction. Will be used to help frontend
    // disable/endable the next/previous page buttons in a product list
    numOfProducts = numOfProducts - numOfAuctionsEnded

    // Send query with pagination
    const queryWithPagination = query + paginationQuery
    const paginatedProductsResult = await db.query(queryWithPagination, queryValues);

    if(!paginatedProductsResult) {
      throw new BadRequestError(`Unable to make request for products in Products.getProducts()`);
    }

    // Return object with the paginated results and total number of products in auction
    const productsAndCount = {
      products: paginatedProductsResult.rows,
      count: numOfProducts
    }
    console.log("productsAndCount", productsAndCount)
    return productsAndCount;
  }

  /** Given a product id, return data about product and its bidder.
   * Throws NotFoundError if not found.**/

  static async getProductAndBid(id) {
    const query =     
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
        WHERE id = $1`

    const productResult = await db.query(query, [id]);

    if (!productResult) throw new BadRequestError(`Unable to get product`);
    
    const product = productResult.rows[0]

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

  // Get products with the most recent bids
  static async recentBidders() {
    // Send query to grab 4 most recent bidded products
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
              highest_bids.bid_price AS "bidPrice",
        highest_bids.datetime
        FROM products
        FULL OUTER JOIN highest_bids ON products.id = highest_bids.product_id
        FULL OUTER JOIN users ON highest_bids.user_email = users.email
        WHERE products.auction_ended = false AND products.bid_count > 0
        ORDER BY highest_bids.datetime DESC
        LIMIT 4`
    )
    if (!endingSoonResult) throw new BadRequestError(`unable to grab latest highest bids`);

    return endingSoonResult.rows
  }

  // Grab all products with a bid (and auction_ended=true) and
  // execute the ProductWon.newWin method on a product if its ending 
  // auction time has passed
  static async hasAuctionEndedForBiddedProducts() {
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

    for ( const p of result.rows) {
      const endingDateTime = new Date(p.auctionEndDt)
      if ((currentDateTime - Date.parse(endingDateTime)) > 0){
        ProductWon.newWin(p.id, p.name, p.bidderEmail, p.bidPrice)
      }
    }
    return result.rows
  }

}

module.exports = Product;