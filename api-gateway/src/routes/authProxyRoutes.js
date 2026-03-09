const express = require("express");
const axios = require("axios");

const router = express.Router();

router.use("/", async (req, res) => {
  try {
    const targetUrl = `${process.env.AUTH_SERVICE_URL}${req.originalUrl}`;

    console.log("Forwarding to Auth Service:", targetUrl);

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
    console.error("Auth proxy error:", error.message);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
      message: "Auth service unavailable",
      error: error.message || "Unknown error",
    });
  }
});

module.exports = router;