/** Routes for users. */
const express = require("express");
const Notification = require("../models/NotificationModel");
const {ensureLoggedIn} = require("../middleware/auth")

const router = express.Router();

// route called to set a user's notifications was_viewed column to true
router.post("/view", ensureLoggedIn, async function (req, res, next) {
  try {
    await Notification.wasViewed(res.locals.user.email);
    return res.json("success");
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
