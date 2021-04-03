/** Routes for products. */

// const jsonschema = require("jsonschema");
const express = require("express");
const ProductWon = require("../models/ProductWonModel");
const Bid = require("../models/BidModel");


const router = new express.Router();

// WORKS!!!!!!!!!!!!!!!!!!!!!!!
// grabs product and bidder information of the products 
// that have most recently been won
router.get("/recent/:numOfProducts", async function (req, res, next) {
  try {
    const numOfProducts = req.params.numOfProducts
    // Grab all bids and check if any auctions have ended
    const bids = await Bid.getBids()

    await ProductWon.checkProductsForAuctionEnded(bids)

    // Grab the most recent winners
    const recentWinners = await ProductWon.getRecentWins(numOfProducts);

    return res.json( recentWinners );
  } catch (err) {
    return next(err);
  }

});



module.exports = router;
