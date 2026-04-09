const { createNewOrder, fetchShopOrders, fetchShopOrderCounts, verifyMobileOtp, verifyPrintReleaseOtp } = require("../services/orderService");

exports.createOrder = async (req, res) => {
  try {
    const order = await createNewOrder(req.body);
    res.status(201).json({ 
      message: "Order created successfully", 
      orderId: order._id,
      status: order.status
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getShopOrders = async (req, res) => {
  try {
    const { shopId } = req.params;
    if (req.user.role !== "shop" || req.user.id !== shopId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const orders = await fetchShopOrders(shopId);
    res.json({ orders });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getShopDashboard = async (req, res) => {
  try {
    const { shopId } = req.params;
    if (req.user.role !== "shop" || req.user.id !== shopId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const stats = await fetchShopOrderCounts(shopId);
    res.json({ stats });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.verifyMobileOtp = async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    if (!orderId || !otp) {
      return res.status(400).json({ message: "orderId and otp are required" });
    }

    const result = await verifyMobileOtp(orderId, otp);
    if (!result) {
      return res.status(400).json({ message: "Invalid OTP or order not found" });
    }

    res.json({
      message: "Mobile OTP verified",
      orderId: result.order._id,
      printReleaseOtp: result.printReleaseOtp,
      status: result.order.status
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.verifyPrintReleaseOtp = async (req, res) => {
  try {
    if (req.user.role !== "shop") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ message: "otp is required" });
    }

    const order = await verifyPrintReleaseOtp(req.user.id, otp);
    if (!order) {
      return res.status(404).json({ message: "Order not found or invalid OTP" });
    }

    const io = req.app.get("io");
    if (io && order.shopId) {
      const stats = await fetchShopOrderCounts(order.shopId);
      io.to(order.shopId.toString()).emit("order-stats", stats);
    }

    res.json({
      message: "Print release OTP verified",
      orderId: order._id,
      customerName: order.customerName,
      pages: order.pages,
      printType: order.printType,
      colorMode: order.colorMode,
      paymentMethod: order.paymentMethod,
      status: order.status
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
