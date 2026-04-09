const mongoose = require("mongoose");
const Order = require("../models/Order");
const Shop = require("../models/Shop");

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

exports.createNewOrder = async ({ shopId, customerName, customerPhone, pages, printType, colorMode, paymentMethod }) => {
  if (!shopId || !customerName || !customerPhone || !pages) {
    throw new Error("shopId, customerName, customerPhone and pages are required");
  }

  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new Error("Shop not found");
  }

  const mobileOtp = "0000"; // Default OTP for now

  return await Order.create({
    shopId,
    customerName,
    customerPhone,
    pages,
    printType: printType || "portrait",
    colorMode: colorMode || "bw",
    paymentMethod: paymentMethod || "cash",
    mobileOtp
  });
};

exports.fetchShopOrders = async (shopId) => {
  return await Order.find({ shopId })
    .select("status printType colorMode createdAt")
    .sort({ createdAt: -1 });
};

exports.fetchShopOrderCounts = async (shopId) => {
  const objectId = mongoose.Types.ObjectId.isValid(shopId) ? mongoose.Types.ObjectId(shopId) : shopId;
  const counts = await Order.aggregate([
    { $match: { shopId: objectId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const stats = {
    totalOrders: 0,
    pendingMobileVerification: 0,
    mobileVerified: 0,
    confirmedOrders: 0,
    printingOrders: 0,
    doneOrders: 0
  };

  counts.forEach((item) => {
    stats.totalOrders += item.count;
    if (item._id === "pending_mobile_verification") stats.pendingMobileVerification = item.count;
    if (item._id === "mobile_verified") stats.mobileVerified = item.count;
    if (item._id === "confirmed") stats.confirmedOrders = item.count;
    if (item._id === "printing") stats.printingOrders = item.count;
    if (item._id === "done") stats.doneOrders = item.count;
  });

  return stats;
};

exports.verifyMobileOtp = async (orderId, otp) => {
  const order = await Order.findById(orderId);
  if (!order || order.mobileOtp !== otp || order.status !== "pending_mobile_verification") {
    return null;
  }

  order.status = "mobile_verified";
  const printReleaseOtp = generateOtp();
  order.printReleaseOtp = printReleaseOtp;
  await order.save();
  return { order, printReleaseOtp };
};

exports.verifyPrintReleaseOtp = async (shopId, otp) => {
  const order = await Order.findOne({ shopId, printReleaseOtp: otp, status: "mobile_verified" });
  if (!order) {
    return null;
  }

  order.status = "confirmed";
  await order.save();
  return order;
};
