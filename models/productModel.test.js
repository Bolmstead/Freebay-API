// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const Product = require("../models/productModel");

const {
  commonBeforeAll,
  commonAfterAll,
  testProducts,
  testUsers,
  testTokens,
  tomorrow
} = require("./_testCommon");

beforeAll(commonBeforeAll);
afterAll(commonAfterAll);

/************************************** getProducts */

describe("getProducts works", function () {
  test("works: no search query", async function () {
    let products = await Product.getProducts();
    expect(products).toEqual({
      products:
          [
            {
              name: "iPhone",
              category: "Electronics",
              subCategory: "Cell Phones and Accessories",
              description: "Example description for iPhone",
              rating: 5,
              numOfRatings: 23,
              imageUrl: "https://images-na.ssl-images-amazon.com/images/I/71nK-Ti90%2BL._AC_SX522_.jpg",
              startingBid: 30,
              auctionEndDt: tomorrow
            },
            {
              name: "Candy Bar",
              category: "Misc.",
              subCategory: "Grocery",
              description: "Example description for Candy Bar",
              rating: 2,
              numOfRatings: 1,
              imageUrl: null,
              startingBid: 40,
              auctionEndDt: tomorrow
            }
          ],
    })
  });

  test("works: by subCategory name", async function () {
    let products = await Product.getProducts({ subCategory: "Grocery" });
    expect(products).toEqual([
      {
        name: "Candy Bar",
        category: "Misc.",
        subCategory: "Grocery",
        description: "Example description for Candy Bar",
        rating: 2,
        numOfRatings: 1,
        imageUrl: null,
        startingBid: 40,
        auctionEndDt: tomorrow
      }
    ]);
  });
});

/************************************** getProduct */

describe("getProduct works", function () {
  test("works", async function () {
    let Product = await Product.getProduct(1);
    expect(Product).toEqual([
      {
        name: "iPhone",
        category: "Electronics",
        subCategory: "Cell Phones and Accessories",
        description: "Example description for iPhone",
        rating: 5,
        numOfRatings: 23,
        imageUrl: "https://images-na.ssl-images-amazon.com/images/I/71nK-Ti90%2BL._AC_SX522_.jpg",
        startingBid: 30,
        auctionEndDt: tomorrow
      }
    ])
  });


  test("not found if no such Product", async function () {
    try {
      await Product.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});


/************************************** getProduct */

describe("endAuction works", function () {
  test("works", async function () {
    const auctionEnded = await Product.endAuction(1);
    expect(auctionEnded).toEqual(true)
  })
})