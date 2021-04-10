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


/************************************** GET /products */

describe("GET /products", function () {
  test("get all products", async function () {
    const resp = await request(app).get("/products");
    expect(resp.body).toEqual({
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
    });
    console.log("resp.body in getallproducts!!!!!!!!!!!!1", resp.body)

  });

  test("works: filtering", async function () {
    const resp = await request(app)
        .get("/products")
        .query({ subCategory: "Cell Phones and Accessories" });
    expect(resp.body).toEqual({
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
          }
        ],
    });
    console.log("resp.body in works: filtering!!!!!!!!!!!!1", resp.body)
  });

  test("works: filtering on multiple filters", async function () {
    const resp = await request(app)
        .get("/products")
        .query({ rating: 1, numOfRatings: 31, name:"Candy" });
    expect(resp.body).toEqual({
      products:
        [
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
    });
    console.log("resp.body in filtering multiple filters!!!!!!!!!!!!!!!!!!!!!1", resp.body)
  });

  test("bad request if invalid filter key", async function () {
    const resp = await request(app)
        .get("/products")
        .query({ rating: 2, nope: "nope" });
    expect(resp.statusCode).toEqual(400);a
  });
});

/************************************** GET /products/:id */

// describe("GET /products/:id", function () {
//   test("works for anon", async function () {
//     const resp = await request(app).get(`/products/1`);
//     expect(resp.body).toEqual({
//       product: {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//         jobs: [
//           { id: testJobIds[0], title: "J1", equity: "0.1", salary: 1 },
//           { id: testJobIds[1], title: "J2", equity: "0.2", salary: 2 },
//           { id: testJobIds[2], title: "J3", equity: null, salary: 3 },
//         ],
//       },
//     });
//   });

//   test("works for anon: product w/o jobs", async function () {
//     const resp = await request(app).get(`/products/c2`);
//     expect(resp.body).toEqual({
//       product: {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//         jobs: [],
//       },
//     });
//   });

//   test("not found for no such product", async function () {
//     const resp = await request(app).get(`/products/nope`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });

// /************************************** PATCH /products/:handle */

// describe("PATCH /products/:handle", function () {
//   test("works for admin", async function () {
//     const resp = await request(app)
//         .patch(`/products/c1`)
//         .send({
//           name: "C1-new",
//         })
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.body).toEqual({
//       product: {
//         handle: "c1",
//         name: "C1-new",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     });
//   });

//   test("unauth for non-admin", async function () {
//     const resp = await request(app)
//         .patch(`/products/c1`)
//         .send({
//           name: "C1-new",
//         })
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//         .patch(`/products/c1`)
//         .send({
//           name: "C1-new",
//         });
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found on no such product", async function () {
//     const resp = await request(app)
//         .patch(`/products/nope`)
//         .send({
//           name: "new nope",
//         })
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(404);
//   });

//   test("bad request on handle change attempt", async function () {
//     const resp = await request(app)
//         .patch(`/products/c1`)
//         .send({
//           handle: "c1-new",
//         })
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(400);
//   });

//   test("bad request on invalid data", async function () {
//     const resp = await request(app)
//         .patch(`/products/c1`)
//         .send({
//           logoUrl: "not-a-url",
//         })
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(400);
//   });
// });

// /************************************** DELETE /products/:handle */

// describe("DELETE /products/:handle", function () {
//   test("works for admin", async function () {
//     const resp = await request(app)
//         .delete(`/products/c1`)
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.body).toEqual({ deleted: "c1" });
//   });

//   test("unauth for non-admin", async function () {
//     const resp = await request(app)
//         .delete(`/products/c1`)
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//         .delete(`/products/c1`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found for no such product", async function () {
//     const resp = await request(app)
//         .delete(`/products/nope`)
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });
