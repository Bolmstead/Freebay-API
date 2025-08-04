"use strict";

/** Express app for jobly. */

const express = require("express");
const cors = require("cors");
const { NotFoundError } = require("./expressError");
const { authenticateJWT } = require("./middleware/auth");
const productsRoutes = require("./routes/productsRoutes");
const usersRoutes = require("./routes/usersRoutes");
const authRoutes = require("./routes/authRoutes");
const bidsRoutes = require("./routes/bidsRoutes");
const productsWonRoutes = require("./routes/productsWonRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");
const testRoute = require("./routes/testRoute");

const morgan = require("morgan");
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/products", productsRoutes);
app.use("/users", usersRoutes);
app.use("/auth", authRoutes);
app.use("/bids", bidsRoutes);
app.use("/products-won", productsWonRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/test", testRoute);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
