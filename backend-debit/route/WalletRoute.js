const express = require("express");
const router = express.Router();

const {
  getWallet,
  topup,
  transfer,
  getTransactions,
  checkRecipient,
} = require("../controller/WalletController");

const authMiddleware = require("../middleware/AuthMiddleware");
router.get("/wallet", authMiddleware, getWallet);
router.post("/topup", authMiddleware, topup);
router.post("/transfer/check", authMiddleware, checkRecipient);
router.post("/transfer", authMiddleware, transfer);
router.get("/transactions", authMiddleware, getTransactions);
module.exports = router;
