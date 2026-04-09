const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shopController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { checkStatus } = require("../middlewares/statusMiddleware");

router.post("/register", shopController.register);
router.post("/login", shopController.login);
router.get("/barcode/:barcode", shopController.getShopByBarcode);
router.get("/search", shopController.searchShops);
router.get("/dashboard", verifyToken, checkStatus, shopController.dashboard);

module.exports = router;
