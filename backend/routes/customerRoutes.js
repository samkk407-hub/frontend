const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/register", customerController.register);
router.post("/login", customerController.login);
router.get("/profile", verifyToken, customerController.profile);

module.exports = router;
