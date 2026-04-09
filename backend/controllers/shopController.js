const Shop = require("../models/Shop");
const { registerShop, loginShop, getShopByBarcode } = require("../services/shopService");
const { generateToken } = require("../utils/jwt");

exports.register = async (req, res) => {
  try {
    const shop = await registerShop(req.body);
    res.status(201).json({ message: "Registered successfully", status: shop.status });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const shop = await loginShop(req.body);
    const token = generateToken({ id: shop._id, role: "shop", status: shop.status });
    res.json({ token, status: shop.status });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getShopByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const shop = await getShopByBarcode(barcode);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    res.json({
      shopId: shop._id,
      shopName: shop.shopName,
      address: shop.address,
      phone: shop.phone,
      printRates: shop.printRates,
      services: shop.services
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.searchShops = async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ message: "City parameter is required" });
    }

    const shops = await Shop.find({
      "address.city": { $regex: city, $options: "i" },
      status: "active"
    }).select("shopName address phone rating printRates services barcode");

    res.json({ shops });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.dashboard = async (req, res) => {
  res.json({ message: "Shop dashboard", user: req.user });
};
