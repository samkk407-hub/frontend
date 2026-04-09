const { registerAdmin, loginAdmin, getAllShops, updateShopStatus, getAllCustomers, getAllOrders } = require("../services/adminService");
const { generateToken } = require("../utils/jwt");

exports.register = async (req, res) => {
  try {
    const admin = await registerAdmin(req.body);
    res.status(201).json({ message: "Admin registered successfully", id: admin._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const admin = await loginAdmin(req.body);
    const token = generateToken({ id: admin._id, role: "admin", status: admin.status });
    res.json({ token, status: admin.status });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getShops = async (req, res) => {
  try {
    const shops = await getAllShops();
    res.json({ shops });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateShopStatus = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "blocked", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const shop = await updateShopStatus(shopId, status);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.json({ message: "Shop status updated", shop });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await getAllCustomers();
    res.json({ customers });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.json({ orders });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
