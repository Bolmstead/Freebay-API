/** Routes for products. */

// const jsonschema = require("jsonschema");
const express = require("express");
const ProductWon = require("../models/ProductWonModel");
const Bid = require("../models/BidModel");
const Product = require("../models/ProductModel");

const Notification = require("../models/NotificationModel");

const router = new express.Router();

// grabs product and bidder information of the products 
// that have most recently been won
router.get("/recent/:num", async function (req, res, next) {
  try {
    const numOfProducts = req.params.num
    // Since the recent wins and recent bids feeds are on the homepage,
    // when a user accesses the homepage, both of these routes will be called:
    // /bids/recent/:num & /products-won/recent/:num    

    // because all bids have been checked to determine if their auction
    // has ended, there is no need to do it again in this route

    // Grab the updated most recent winners
    const recentWinners = await ProductWon.getRecentWins(numOfProducts);

    return res.json( recentWinners );
  } catch (err) {
    return next(err);
  }

});



module.exports = router;
