/** Routes for users. */
const express = require("express");
const Notification = require("../models/NotificationModel");

const router = express.Router();

// WORKS!!!!!!
// NEEDS MIDDLEWARE
// route called to set a user's notifications was_viewed column to true
router.post("/view/:email", async function (req, res, next) {
  try {
    await Notification.wasViewed(req.params.email);
    return res.json("success");
  } catch (err) {
    return next(err);
  }
});



module.exports = router;
