/** Routes for products. */

// const jsonschema = require("jsonschema");
const express = require("express");
const { authenticateJWT } = require("../middleware/auth");
const Product = require("../models/ProductModel");
const Bid = require("../models/BidModel");
const ProductWon = require("../models/ProductWonModel");
const { checkForEndedAuctions } = require("../helpers/checkForEndedAuctions.js");




const router = new express.Router();

// route grabs all information of a group of products.
// search query can be passed to the route to specify which products to pull
router.get("/", async function (req, res, next) {
  try {
    const q = req.query;
    const allProducts = await Product.getProducts(q);

    // Check all queried products if their auction has ended.
    // If so, execute newWin method and add one to numberOfAuctionsEnded.
    let numberOfAuctionsEnded = await checkForEndedAuctions(allProducts)
    

    const paginatedProducts = await Product.getProducts(q, pagination = true)
    return  res.json({
      products: paginatedProducts,
      numOfProductsInAuction: (allProducts.length - numberOfAuctionsEnded)
    })
  } catch (err){
    return next(err)
  }

});

// Grabs information about the product and bidder
router.get("/:id", async function (req, res, next) {
  try {
    let productResult = await Product.getProduct(req.params.id);

    let numberOfAuctionsEnded = await checkForEndedAuctions([productResult])

    if (numberOfAuctionsEnded > 0) {
      productResult = await Product.getProduct(req.params.id)
    } else {
      if (productResult.bidId) {
        const numOfBids = await Bid.getBidCount(req.params.id)
        productResult["numOfBids"] = numOfBids
      } else {
        productResult["numOfBids"] = 0
      }
    }
    console.log("productResult in products/:id", productResult)
    return res.json({ productResult});
  } catch (err) {
    return next(err);
  }

});






module.exports = router;
