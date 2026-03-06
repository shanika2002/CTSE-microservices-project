const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 8001;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Inventory service running on port ${PORT}`);
  });
};

startServer();