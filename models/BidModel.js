"use strict";

const { mongoose } = require("../db");
const { BadRequestError } = require("../expressError");
const { formatBidProduct } = require("../helpers/modelFormatters");

const bidSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true,
  },
  userEmail: { type: String, required: true, index: true },
  bidPrice: { type: Number, required: true, min: 0 },
  isHighestBid: { type: Boolean, default: true, index: true },
  wasWinningBid: { type: Boolean, default: false, index: true },
  bidTime: { type: Date, default: Date.now, index: true },
});

bidSchema.statics.addBid = async function (productId, userEmail, newBid) {
  const bid = await this.create({
    product: productId,
    userEmail,
    bidPrice: Number(newBid),
  });

  if (!bid) throw new BadRequestError("Bid not added");
  return bid;
};

bidSchema.statics.getRecentBids = async function (numOfProducts) {
  const User = require("./UserModel");

  const bids = await this.find({ isHighestBid: true, wasWinningBid: false })
    .sort({ bidTime: -1 })
    .populate("product");

  const activeBids = bids.filter((bid) => bid.product && !bid.product.auctionEnded);
  const limitedBids = numOfProducts ? activeBids.slice(0, Number(numOfProducts)) : activeBids;
  const emails = [...new Set(limitedBids.map((bid) => bid.userEmail))];
  const users = await User.find({ email: { $in: emails } });
  const usersByEmail = new Map(users.map((user) => [user.email, user]));

  return limitedBids.map((bid) =>
    formatBidProduct(bid, bid.product, usersByEmail.get(bid.userEmail))
  );
};

bidSchema.statics.setIsHighestBidToFalse = async function (bidId) {
  const bid = await this.findByIdAndUpdate(bidId, { isHighestBid: false }, { new: true });
  if (!bid) throw new BadRequestError(`Bid not found: ${bidId}`);
  return bid;
};

bidSchema.statics.updateBidAsWinningBid = async function (bidId) {
  const bid = await this.findByIdAndUpdate(bidId, { wasWinningBid: true }, { new: true });
  if (!bid) throw new BadRequestError(`Bid not found: ${bidId}`);
  return bid;
};

bidSchema.statics.getBidCount = async function (productId) {
  return this.countDocuments({ product: productId });
};

module.exports = mongoose.model("Bid", bidSchema);
