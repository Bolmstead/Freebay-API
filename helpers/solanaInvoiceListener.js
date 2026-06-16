"use strict";

const {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} = require("@solana/web3.js");
const Invoice = require("../models/InvoiceModel");
const { MERCHANT_WALLET_ADDRESS, SOLANA_RPC_URL } = require("../config");

let listenerStarted = false;
let subscriptionId = null;
const seenSignatures = new Set();

function parsedTransferAmountToSol(info) {
  if (!info) return 0;
  if (info.lamports !== undefined) return Number(info.lamports) / LAMPORTS_PER_SOL;
  if (info.amount !== undefined) return Number(info.amount) / LAMPORTS_PER_SOL;
  return 0;
}

function collectTransfersToMerchant(parsedTransaction, merchantAddress) {
  const transfers = [];
  const instructions = parsedTransaction.transaction.message.instructions || [];
  const innerInstructions = parsedTransaction.meta.innerInstructions || [];

  function inspectInstruction(instruction) {
    if (!instruction.parsed || instruction.parsed.type !== "transfer") return;

    const info = instruction.parsed.info;
    if (info.destination !== merchantAddress) return;

    const amountSOL = parsedTransferAmountToSol(info);
    if (amountSOL > 0) transfers.push(amountSOL);
  }

  instructions.forEach(inspectInstruction);
  innerInstructions.forEach((inner) => {
    (inner.instructions || []).forEach(inspectInstruction);
  });

  return transfers;
}

async function inspectSignature(connection, merchantAddress, signature) {
  if (!signature || seenSignatures.has(signature)) return;
  seenSignatures.add(signature);

  const parsedTransaction = await connection.getParsedTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });

  if (!parsedTransaction || parsedTransaction.meta?.err) return;

  const transfers = collectTransfersToMerchant(parsedTransaction, merchantAddress);
  for (const amountSOL of transfers) {
    const invoice = await Invoice.matchPayment(merchantAddress, amountSOL, signature);
    if (invoice) {
      console.log(`Confirmed invoice ${invoice._id} with ${signature}`);
      break;
    }
  }
}

function startSolanaInvoiceListener() {
  if (listenerStarted) return;

  if (!MERCHANT_WALLET_ADDRESS) {
    console.warn("Solana listener disabled: MERCHANT_WALLET_ADDRESS is not set");
    return;
  }

  let merchantPublicKey;
  try {
    merchantPublicKey = new PublicKey(MERCHANT_WALLET_ADDRESS);
  } catch (err) {
    console.warn("Solana listener disabled: invalid MERCHANT_WALLET_ADDRESS");
    return;
  }

  const connection = new Connection(SOLANA_RPC_URL, "confirmed");
  listenerStarted = true;

  try {
    subscriptionId = connection.onLogs(
      merchantPublicKey,
      (logs) => {
        inspectSignature(connection, merchantPublicKey.toBase58(), logs.signature).catch((err) =>
          console.error("Solana invoice inspection failed:", err.message)
        );
      },
      "confirmed"
    );
    console.log(`Solana invoice listener started on devnet subscription ${subscriptionId}`);
  } catch (err) {
    listenerStarted = false;
    console.error("Unable to start Solana invoice listener:", err.message);
    return;
  }

  setInterval(async () => {
    try {
      const signatures = await connection.getSignaturesForAddress(merchantPublicKey, { limit: 25 });
      for (const sig of signatures) {
        await inspectSignature(connection, merchantPublicKey.toBase58(), sig.signature);
      }
    } catch (err) {
      console.error("Solana invoice polling failed:", err.message);
    }
  }, 30_000).unref();
}

module.exports = { startSolanaInvoiceListener };
