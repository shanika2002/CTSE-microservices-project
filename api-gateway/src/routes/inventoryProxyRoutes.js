const express = require("express");
const axios = require("axios");

const router = express.Router();

// Forward all /inventory requests to inventory-service
router.use("/", async (req, res) => {
  try {
    const targetUrl = `${process.env.INVENTORY_SERVICE_URL}/products${req.originalUrl.replace("/inventory", "")}`;

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        Authorization: req.headers.authorization || "",
        "Content-Type": "application/json",
      },
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
      message: "Inventory service unavailable",
      error: error.message,
    });
  }
});

module.exports = router;