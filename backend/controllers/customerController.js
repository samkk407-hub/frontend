const { registerCustomer, getCustomerByPhone, loginCustomer } = require("../services/customerService");
const { generateToken } = require("../utils/jwt");

exports.register = async (req, res) => {
  try {
    const customer = await registerCustomer(req.body);
    res.status(201).json({ message: "Customer registered successfully", id: customer._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const customer = await loginCustomer(req.body);
    const token = generateToken({ id: customer._id, role: "customer", phone: customer.phone });
    res.json({ token, customer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.profile = async (req, res) => {
  try {
    const customer = await getCustomerByPhone(req.user.phone);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json({ customer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
