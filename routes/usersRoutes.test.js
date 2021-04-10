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


/************************************** GET /users */

describe("GET /users/:username", function () {
  test("get user", async function () {
    const resp = await request(app).get(`/users/${user1.userName}`);
    expect(resp.body).toEqual(
      {
        email: user1.email,
        username: user1.userName,
        password: user1.password,
        firstName: user1.firstName,
        lastName: user1.lastName,
        imageUrl: user1.imageUrl,
        balance: user1.balance,
        bids: [],
        productsWon: [],
        notifications: [],
      }
    );
  });

  test("404 if missing user", async function () {
    const resp = await request(app)
        .get(`users/noUser`)
    expect(resp.statusCode).toEqual(404);
  });

});


/************************************** GET /users/:id */

// describe("GET /users/:id", function () {
//   test("works for anon", async function () {
//     const resp = await request(app).get(`/users/1`);
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
//     const resp = await request(app).get(`/users/c2`);
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
//     const resp = await request(app).get(`/users/nope`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });

// /************************************** PATCH /users/:handle */

// describe("PATCH /users/:handle", function () {
//   test("works for admin", async function () {
//     const resp = await request(app)
//         .patch(`/users/c1`)
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
//         .patch(`/users/c1`)
//         .send({
//           name: "C1-new",
//         })
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//         .patch(`/users/c1`)
//         .send({
//           name: "C1-new",
//         });
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found on no such product", async function () {
//     const resp = await request(app)
//         .patch(`/users/nope`)
//         .send({
//           name: "new nope",
//         })
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(404);
//   });

//   test("bad request on handle change attempt", async function () {
//     const resp = await request(app)
//         .patch(`/users/c1`)
//         .send({
//           handle: "c1-new",
//         })
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(400);
//   });

//   test("bad request on invalid data", async function () {
//     const resp = await request(app)
//         .patch(`/users/c1`)
//         .send({
//           logoUrl: "not-a-url",
//         })
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(400);
//   });
// });

// /************************************** DELETE /users/:handle */

// describe("DELETE /users/:handle", function () {
//   test("works for admin", async function () {
//     const resp = await request(app)
//         .delete(`/users/c1`)
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.body).toEqual({ deleted: "c1" });
//   });

//   test("unauth for non-admin", async function () {
//     const resp = await request(app)
//         .delete(`/users/c1`)
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//         .delete(`/users/c1`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found for no such product", async function () {
//     const resp = await request(app)
//         .delete(`/users/nope`)
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });




