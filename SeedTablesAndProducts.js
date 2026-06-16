"use strict";

const products1 = require("./products_1");
const products2 = require("./products_2");
const products3 = require("./products_3");
const { connectDB, mongoose } = require("./db");
const Product = require("./models/ProductModel");
const User = require("./models/UserModel");
const Bid = require("./models/BidModel");
const ProductWon = require("./models/ProductWonModel");
const Notification = require("./models/NotificationModel");
const Invoice = require("./models/InvoiceModel");

class FreebaySeed {
  static randomDate() {
    const currentDateTime = new Date();
    return new Date(currentDateTime.getTime() + Math.random() * 3000000000);
  }

  static randomRating() {
    return Math.floor(Math.random() * 4) + 2;
  }

  static randomNumberOfRatings() {
    return Math.floor(Math.random() * 1111);
  }

  static productFromScrapedItem(item, startingBidMultiplier) {
    let startingBid = Math.round(100 * (Number(item.market_price) * startingBidMultiplier)) / 100;
    if (!startingBid) startingBid = 5;

    return {
      name: item.item,
      category: item.category,
      subCategory: item.sub_category,
      description: item.description,
      rating: FreebaySeed.randomRating(),
      numOfRatings: FreebaySeed.randomNumberOfRatings(),
      imageUrl: item.image_1,
      startingBid,
      auctionEndDt: FreebaySeed.randomDate(),
      auctionEnded: false,
    };
  }

  static async createTables() {
    await connectDB();
    await Promise.all([
      Product.deleteMany({}),
      User.deleteMany({}),
      Bid.deleteMany({}),
      ProductWon.deleteMany({}),
      Notification.deleteMany({}),
      Invoice.deleteMany({}),
    ]);
  }

  static async seedAllProducts() {
    const products = [
      ...products1.map((product) => FreebaySeed.productFromScrapedItem(product, 0.66)),
      ...products2.map((product) => FreebaySeed.productFromScrapedItem(product, 0.5)),
      ...products3.map((product) => FreebaySeed.productFromScrapedItem(product, 0.5)),
    ];

    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);
  }

  static async seedAll() {
    await FreebaySeed.createTables();
    await FreebaySeed.seedAllProducts();
  }
}

if (require.main === module) {
  FreebaySeed.seedAll()
    .then(async () => {
      await mongoose.connection.close();
      console.log("MongoDB seed complete");
    })
    .catch(async (err) => {
      console.error(err);
      await mongoose.connection.close();
      process.exit(1);
    });
}

module.exports = FreebaySeed;
