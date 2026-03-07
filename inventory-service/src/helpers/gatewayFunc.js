const axios = require("axios");

// Helper: make authenticated call via gateway
async function callViaGateway(method, path, data = {}, headers = {}) {
  try {
    const response = await axios({
      method,
      url: `${process.env.GATEWAY_URL}${path}`,
      data,
      headers: {
        Authorization: headers.authorization || "",
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Gateway call failed: ${path}`, error.message);

    if (error.response) {
      throw new Error(error.response.data.message || "Gateway request failed");
    }

    throw error;
  }
}

module.exports = { callViaGateway };