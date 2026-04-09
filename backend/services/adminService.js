const Shop = require("../models/Shop");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Admin = require("../models/Admin");
const { hashPassword, comparePassword } = require("../utils/hash");

exports.registerAdmin = async ({ name, email, password }) => {
  const exist = await Admin.findOne({ email });
  if (exist) throw new Error("Admin already exists");

  const hashed = await hashPassword(password);
  return await Admin.create({ name, email, password: hashed });
};

exports.loginAdmin = async ({ email, password }) => {
  const admin = await Admin.findOne({ email });
  if (!admin) throw new Error("Invalid admin email");

  const match = await comparePassword(password, admin.password);
  if (!match) throw new Error("Wrong password");

  return admin;
};

exports.getAllShops = async () => {
  return await Shop.find().sort({ createdAt: -1 });
};

exports.updateShopStatus = async (shopId, status) => {
  return await Shop.findByIdAndUpdate(shopId, { status }, { new: true });
};

exports.getAllCustomers = async () => {
  return await Customer.find().sort({ createdAt: -1 });
};

exports.getAllOrders = async () => {
  return await Order.find().sort({ createdAt: -1 });
};
