const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

router.post("/register", adminController.register);
router.post("/login", adminController.login);
router.get("/shops", verifyToken, verifyAdmin, adminController.getShops);
router.put("/shop/:shopId/status", verifyToken, verifyAdmin, adminController.updateShopStatus);
router.get("/customers", verifyToken, verifyAdmin, adminController.getCustomers);
router.get("/orders", verifyToken, verifyAdmin, adminController.getOrders);

module.exports = router;
