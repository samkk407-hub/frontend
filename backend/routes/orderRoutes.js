const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyToken } = require("../middlewares/authMiddleware");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

// Customer creates order with document upload.
router.post("/create", upload.single("document"), orderController.createOrder);

// Customer verifies mobile OTP and shop receives print release OTP.
router.post("/verify-mobile-otp", orderController.verifyMobileOtp);

// Shop verifies print release OTP; token required.
router.post("/verify-print-otp", verifyToken, orderController.verifyPrintReleaseOtp);

// Shop opens the uploaded order document inline.
router.get("/:id/document", verifyToken, orderController.getDocument);

// Shop marks the order as printed.
router.put("/:id/print", verifyToken, orderController.markPrinted);

module.exports = router;
