const express = require("express");
const cors = require("cors");
const authProxyRoutes = require("./routes/authProxyRoutes");
const inventoryProxyRoutes = require("./routes/inventoryProxyRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API Gateway is running",
  });
});

app.use("/auth", authProxyRoutes);
app.use("/inventory", inventoryProxyRoutes);

module.exports = app;