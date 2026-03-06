const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateStock,
  checkStock,
} = require("../controllers/productController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createProduct);
router.get("/", protect, getAllProducts);
router.post("/check-stock", protect, checkStock);
router.get("/:id", protect, getProductById);
router.put("/:id", protect, updateProduct);
router.patch("/:id/stock", protect, updateStock);

module.exports = router;