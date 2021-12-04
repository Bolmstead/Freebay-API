/** Routes for products. */

// const jsonschema = require("jsonschema");
const express = require("express");

const router = new express.Router();

// route grabs all information of a group of products.
// search query can be passed to the route to specify which products to pull
router.get("/", async function (req, res, next) {
  try {
    return res.json({
      status: "works!",
    });
  } catch (err) {
    console.log("error: ", err);
    return next(err);
  }
});

module.exports = router;
