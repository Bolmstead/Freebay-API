"use strict";

const db = require("../db");
const { BadRequestError } = require("../expressError");
const ProductWon = require("./ProductWonModel");


/** Related functions for products. */

class Product {
  // Grabs products and their bidder info based on search query parameters.
  // Utilizes pagination with a max number of products in each query. 
  static async getProducts(q, pagination = false) {
    let query = `SELECT products.id,
                        products.name,
                        products.category,
                        products.sub_category AS "subCategory",
                        products.description,
                        products.rating,
                        products.num_of_ratings AS "numOfRatings",
                        products.image_url AS "imageUrl",
                        products.starting_bid AS "startingBid",
                        products.auction_end_dt AS "auctionEndDt",
                        products.auction_ended AS "auctionEnded",
                        users.email AS "bidderEmail",
                        users.first_name AS "bidderFirstName",
                        users.last_name AS "bidderLastName",
                        users.username AS "bidderUsername",
                        bids.bid_price AS "bidPrice",
                        bids.bid_id AS "bidId",
                        bids.is_highest_bid AS "isHighestBid",
                        bids.was_winning_bid AS "wasWinningBid",
                        bids.user_email AS "bidderEmail"
                FROM products
                FULL OUTER JOIN bids ON products.id = bids.product_id
                FULL OUTER JOIN users ON bids.user_email = users.email`;

    // whereExpressions, queryValues, and paginationQuery that will be inserted into query
    let whereExpressions = [];
    let queryValues = []; 

    let { page, name, category, subCategory, description, 
      rating, numOfRatings} = q;

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
      queryValues.push(`%${description}%`);
      whereExpressions.push(`description ILIKE $${queryValues.length}`);
    }

    if (rating !== undefined) {
      queryValues.push(rating);
      whereExpressions.push(`rating >= $${queryValues.length}`);
    }

    if (numOfRatings !== undefined) {
      queryValues.push(numOfRatings);
      whereExpressions.push(`num_of_ratings >= $${queryValues.length}`);
    }

    // add only products that are in auction to query along 
    // with the where expressions
    whereExpressions.push(`
    products.auction_ended = false 
      AND (bids.is_highest_bid = true 
      OR bids.is_highest_bid IS NULL)`);
    query += " WHERE " + whereExpressions.join(" AND ");

    // Send query for all products. 
    const allProductsResult = await db.query(query, queryValues);
    if(!allProductsResult) {
      throw new BadRequestError(`Unable to make request for all products in Products.getProducts()`);
    }

    // If pagination parameter has not been passed into function, return all products
    if (!pagination) {
      return allProductsResult.rows
    } else {

      // Otherwise, return paginated results
      let paginationQuery = " limit 24 OFFSET ";
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

      // Send query with pagination
      const queryWithPagination = query + paginationQuery
      const paginatedProductsResult = await db.query(queryWithPagination, queryValues);

      if(!paginatedProductsResult) {
        throw new BadRequestError(`Unable to make request for products in Products.getProducts()`);
      }

      return paginatedProductsResult.rows;
    }
  }

  /** Given a product id, return data about product and its bidder.
   * Throws NotFoundError if not found.**/

  static async getProduct(id) {
    const query =     
        `SELECT products.id,
        products.name,
        products.category,
        products.sub_category AS "subCategory",
        products.description,
        products.rating,
        products.num_of_ratings AS "numOfRatings",
        products.image_url AS "imageUrl",
        products.starting_bid AS "startingBid",
        products.auction_end_dt AS "auctionEndDt",
        products.auction_ended AS "auctionEnded",
        bids.user_email AS "bidderEmail",
        bids.bid_price AS "bidPrice",
        bids.is_highest_bid AS "isHighestBid",
        bids.bid_id AS "bidId",
        bids.was_winning_bid AS "wasWinningBid",
        users.username AS "bidderUsername"
    FROM products
    FULL OUTER JOIN bids ON products.id = bids.product_id
    FULL OUTER JOIN users ON bids.user_email = users.email
	  WHERE products.id = $1
    ORDER BY bids.is_highest_bid DESC`

    const productResult = await db.query(query, [id]);

    if (!productResult) throw new BadRequestError(`Unable to get product`);
    
    const product = productResult.rows[0]

    return product;
  }

  // Set the auction_ended value on the product to true
  static async endAuction(productId) {
    const auctionEndedResult = await db.query(
      `UPDATE products 
        SET auction_ended = true
        WHERE id = $1
        RETURNING auction_ended AS "auctionEnded"
        `,[productId]
    );

    if (!auctionEndedResult) throw new BadRequestError(`productauctionEnded boolean value unchanged ${auctionEndedResult}`);
  }
}

module.exports = Product;