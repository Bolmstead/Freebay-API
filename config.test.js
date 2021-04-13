"use strict";

describe("config can come from env", function () {
  test("works", function() {
    process.env.SECRET_KEY = "secret-key333";
    process.env.PORT = 5000;
    process.env.DATABASE_URL = "freebay_test";
    process.env.NODE_ENV = "test";

    const config = require("./config");
    expect(config.SECRET_KEY).toEqual("secret-key333");
    expect(config.PORT).toEqual(5000);
    expect(config.getDatabaseUri()).toEqual("freebay_test");
    expect(config.BCRYPT_WORK_FACTOR).toEqual(12);

    delete process.env.SECRET_KEY;
    delete process.env.PORT;
    delete process.env.BCRYPT_WORK_FACTOR;
    delete process.env.DATABASE_URL;

    expect(config.getDatabaseUri()).toEqual("freebay_test");
  });
})

