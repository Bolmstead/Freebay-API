"use strict";

const app = require("./app");
const { PORT } = require("./config");
const { connectDB } = require("./db");
const { startSolanaInvoiceListener } = require("./helpers/solanaInvoiceListener");

async function startServer() {
  await connectDB();
  startSolanaInvoiceListener();

  app.listen(PORT, function () {
    console.log(`Started on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start FreeBay API:", err);
  process.exit(1);
});
