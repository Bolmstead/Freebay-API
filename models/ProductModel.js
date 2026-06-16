"use strict";

const { mongoose } = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { formatProduct } = require("../helpers/modelFormatters");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  description: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  numOfRatings: { type: Number, required: true, min: 0 },
  imageUrl: { type: String },
  startingBid: { type: Number, required: true, min: 0 },
  auctionEndDt: { type: Date, required: true },
  auctionEnded: { type: Boolean, default: false },
});

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, subCategory: 1, auctionEnded: 1 });

function regex(value, prefixOnly = false) {
  const escaped = String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(prefixOnly ? `^${escaped}` : escaped, "i");
}

function buildProductFilter(q = {}) {
  const filter = { auctionEnded: false };

  if (q.name !== undefined) filter.name = regex(q.name);
  if (q.category !== undefined) filter.category = regex(q.category);
  if (q.subCategory !== undefined) filter.subCategory = regex(q.subCategory, true);
  if (q.description !== undefined) filter.description = regex(q.description);
  if (q.rating !== undefined) filter.rating = { $gte: Number(q.rating) };
  if (q.numOfRatings !== undefined) filter.numOfRatings = { $gte: Number(q.numOfRatings) };

  return filter;
}

productSchema.statics.attachHighestBids = async function (products) {
  const Bid = require("./BidModel");
  const User = require("./UserModel");

  const ids = products.map((p) => p._id);
  const bids = await Bid.find({ product: { $in: ids }, isHighestBid: true });
  const bidsByProduct = new Map(bids.map((bid) => [bid.product.toString(), bid]));
  const emails = [...new Set(bids.map((bid) => bid.userEmail))];
  const users = await User.find({ email: { $in: emails } });
  const usersByEmail = new Map(users.map((user) => [user.email, user]));

  return products.map((product) => {
    const bid = bidsByProduct.get(product._id.toString());
    const bidder = bid ? usersByEmail.get(bid.userEmail) : null;
    return formatProduct(product, bid, bidder);
  });
};

productSchema.statics.getProducts = async function (q, pagination = false) {
  const filter = buildProductFilter(q);
  const numberOfProductsPerPage = 24;
  const page = Math.max(parseInt(q.page || "1", 10), 1);
  const query = this.find(filter).sort({ _id: 1 });

  if (pagination) {
    query.skip((page - 1) * numberOfProductsPerPage).limit(numberOfProductsPerPage);
  }

  const products = await query;
  return this.attachHighestBids(products);
};

productSchema.statics.getProduct = async function (id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new NotFoundError(`No product: ${id}`);

  const product = await this.findById(id);
  if (!product) throw new NotFoundError(`No product: ${id}`);

  const [productResult] = await this.attachHighestBids([product]);
  return productResult;
};

productSchema.statics.endAuction = async function (productId) {
  const result = await this.findByIdAndUpdate(
    productId,
    { auctionEnded: true },
    { new: true }
  );

  if (!result) throw new BadRequestError(`Unable to end auction for product ${productId}`);
  return result;
};

module.exports = mongoose.model("Product", productSchema);
