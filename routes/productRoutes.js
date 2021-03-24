/** Routes for products. */

// const jsonschema = require("jsonschema");
const express = require("express");
const { authenticateJWT } = require("../middleware/auth");
const User = require("../models/UserModel");
const Product = require("../models/ProductModel");
const ProductWon = require("../models/ProductWonModel");
const HighestBid = require("../models/HighestBidModel");
const SeedProducts = require("../FreebaySeed");

const router = new express.Router();

// route grabs all information of a group of products.
// search query can be passed to the route to specify which products to pull
router.get("/", async function (req, res, next) {
  try {
    const q = req.query;
    const result = await Product.getProducts(q);
    return res.json( result );
  } catch (err){
    return next(err)
  }

});

// grabs user information and product name of products 
// that have most recently been won
router.get("/recentWinners", async function (req, res, next) {
  try {
    const winners = await ProductWon.getWinsFeed();
    return res.json( winners );
  } catch (err) {
    return next(err);
  }

});

// called to grab product and bidder information 
// of products that have most recently been bidded on
router.get("/recentBidders", async function (req, res, next) {
  try {
    const products = await Product.recentBidders();
    return res.json( products );
  } catch (err) {
    return next(err);
  }

});

// Seeds all products to database.
// Only to be called once at projects deployment
router.get("/SEEDALLPRODUCTS", async function (req, res, next) {
  try {
    const products = await SeedProducts.seedProducts();
    console.log("products",products)
    return res.json("Successfully seeded products to database!");
  } catch (err) {
    return next(err);
  }
});

// Grabs information about the product and bidder
router.get("/:id", async function (req, res, next) {
  try {
    const product = await Product.getProductAndBid(req.params.id);
    return res.json({ product });
  } catch (err) {
    return next(err);
  }

});


// Route for submitting bid on product
router.post("/:productId/bid/:amount", async function (req, res, next) {
  try {
    // grab the user saved in local storage and pull information of that user from API
    const localsUser = res.locals.user;
    const user = await User.get(localsUser.username)

    const productId = req.params.productId;
    const newBid = req.params.amount;
    const product = await Product.getProductAndBid(productId);

    await HighestBid.updateBid(product, user, newBid)

    return res.json({result: "success"});
  } catch (err) {
    return next(err);
  }

});

// Called when user has won a product's auction
router.post("/:productId/winner", async function (req, res, next) {
  try {
    user = res.local.user
    const product = await ProductWon.wonProduct(req.params.productId, user.email);
    return res.json({ product });
  } catch (err) {
    return next(err);
  }

});



module.exports = router;
