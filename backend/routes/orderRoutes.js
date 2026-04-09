const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { checkStatus } = require("../middlewares/statusMiddleware");

router.post("/create", orderController.createOrder);
router.post("/verify-mobile-otp", orderController.verifyMobileOtp);
router.post("/verify-print-otp", verifyToken, checkStatus, orderController.verifyPrintReleaseOtp);
router.get("/shop/:shopId", verifyToken, checkStatus, orderController.getShopOrders);
router.get("/shop/:shopId/dashboard", verifyToken, checkStatus, orderController.getShopDashboard);

module.exports = router;
