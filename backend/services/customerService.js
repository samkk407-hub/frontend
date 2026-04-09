const Customer = require("../models/Customer");

exports.registerCustomer = async ({ name, email, phone }) => {
  const exist = await Customer.findOne({ phone });
  if (exist) throw new Error("Customer already exists");

  return await Customer.create({ name, email, phone });
};

exports.loginCustomer = async ({ phone }) => {
  const customer = await Customer.findOne({ phone });
  if (!customer) throw new Error("Customer not found");
  return customer;
};

exports.getCustomerByPhone = async (phone) => {
  return await Customer.findOne({ phone });
};

exports.getAllCustomers = async () => {
  return await Customer.find().sort({ createdAt: -1 });
};
