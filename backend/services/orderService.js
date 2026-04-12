const mongoose = require("mongoose");
const Order = require("../models/Order");
const Shop = require("../models/Shop");

// Generate a 4-digit OTP for mobile verification or print release.
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

// Create a new order and store the uploaded document path.
exports.createNewOrder = async ({ shopId, customerName, customerPhone, pages, printType, colorMode, paymentMethod, documentUrl, documentPublicId }) => {
  if (!shopId || !customerName || !customerPhone || !pages) {
    throw new Error("shopId, customerName, customerPhone and pages are required");
  }

  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new Error("Shop not found");
  }

  const mobileOtp = generateOtp();

  return await Order.create({
    shopId,
    customerName,
    customerPhone,
    pages,
    printType: printType || "portrait",
    colorMode: colorMode || "bw",
    paymentMethod: paymentMethod || "cash",
    documentUrl,
    documentPublicId,
    mobileOtp,
  });
};

// Verify the customer mobile OTP and generate a print release OTP for the shop.
// The same printReleaseOtp can be reused later.
exports.verifyMobileOtp = async (orderId, otp) => {
  const order = await Order.findById(orderId);
  if (!order || order.mobileOtp !== otp) {
    return null;
  }

  if (!order.printReleaseOtp) {
    order.printReleaseOtp = generateOtp();
    await order.save();
  }

  return { order, printReleaseOtp: order.printReleaseOtp };
};

// Verify the print-release OTP from shop side.
// No 24-hour expiration. Order remains saved.
exports.verifyPrintReleaseOtp = async (shopId, otp) => {
  const order = await Order.findOne({ shopId, printReleaseOtp: otp });
  if (!order) {
    return null;
  }

  return order;
};

// Mark the order as printed when the shop presses the print button.
// This does not delete or change order data.
exports.markOrderPrinted = async (orderId, shopId) => {
  const order = await Order.findOne({ _id: orderId, shopId, printReleaseOtp: { $exists: true, $ne: null } });
  if (!order) {
    return null;
  }

  return order;
};
