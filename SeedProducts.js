"use strict";

const FreebaySeed = require("./SeedTablesAndProducts");
const { mongoose } = require("./db");

if (require.main === module) {
  FreebaySeed.seedAll()
    .then(async () => {
      await mongoose.connection.close();
      console.log("MongoDB products seeded");
    })
    .catch(async (err) => {
      console.error(err);
      await mongoose.connection.close();
      process.exit(1);
    });
}

module.exports = FreebaySeed;
