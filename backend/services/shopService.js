const Shop = require("../models/Shop");
const { hashPassword, comparePassword } = require("../utils/hash");

exports.registerShop = async ({ shopName, email, phone, password }) => {
  const exist = await Shop.findOne({ $or: [{ email }, { phone }] });
  if (exist) throw new Error("Shop already exists");

  const hashed = await hashPassword(password);
  const barcode = Math.random().toString(36).substring(2, 8).toUpperCase();

  return await Shop.create({
    shopName,
    email,
    phone,
    password: hashed,
    barcode
  });
};

exports.loginShop = async ({ email, password }) => {
  const shop = await Shop.findOne({ email });
  if (!shop) throw new Error("Invalid email");

  const match = await comparePassword(password, shop.password);
  if (!match) throw new Error("Wrong password");

  return shop;
};

exports.getShopByBarcode = async (barcode) => {
  return await Shop.findOne({ barcode, status: "active" });
};
