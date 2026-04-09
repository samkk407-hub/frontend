const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/shop", require("./routes/shopRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/customer", require("./routes/customerRoutes"));
app.use("/api/order", require("./routes/orderRoutes"));

module.exports = app;