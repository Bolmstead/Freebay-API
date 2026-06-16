"use strict";

const { mongoose } = require("../db");
const { BadRequestError } = require("../expressError");
const { formatProductWon } = require("../helpers/modelFormatters");

const productWonSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true,
  },
  userEmail: { type: String, required: true, index: true },
  bidPrice: { type: Number, required: true, min: 0 },
  wonTime: { type: Date, default: Date.now, index: true },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
});

productWonSchema.index({ product: 1, userEmail: 1 }, { unique: true });

productWonSchema.statics.newWin = async function (productId, userEmail, bidPrice) {
  let productWon = await this.findOne({ product: productId, userEmail });
  if (productWon) return productWon;

  productWon = await this.create({
    product: productId,
    userEmail,
    bidPrice: Number(bidPrice),
  });

  if (!productWon) throw new BadRequestError("Winning product not added");
  return productWon;
};

productWonSchema.statics.attachInvoice = async function (productWonId, invoiceId) {
  return this.findByIdAndUpdate(productWonId, { invoice: invoiceId }, { new: true });
};

productWonSchema.statics.getRecentWins = async function (numOfProducts) {
  const User = require("./UserModel");

  const wins = await this.find({ bidPrice: { $gt: 1 } })
    .sort({ wonTime: -1 })
    .limit(Number(numOfProducts) || 10)
    .populate("product")
    .populate("invoice");

  const filteredWins = wins.filter((win) => win.product && win.product.auctionEnded);
  const emails = [...new Set(filteredWins.map((win) => win.userEmail))];
  const users = await User.find({ email: { $in: emails } });
  const usersByEmail = new Map(users.map((user) => [user.email, user]));

  return filteredWins.map((win) =>
    formatProductWon(win, win.product, usersByEmail.get(win.userEmail), win.invoice)
  );
};

module.exports = mongoose.model("ProductWon", productWonSchema);
