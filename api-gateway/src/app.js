const express = require("express");
const cors = require("cors");
const authProxyRoutes = require("./routes/authProxyRoutes");
const inventoryProxyRoutes = require("./routes/inventoryProxyRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API Gateway is running",
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/auth", authProxyRoutes);
app.use("/inventory", inventoryProxyRoutes);

module.exports = app;