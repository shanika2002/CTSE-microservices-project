const mongoose = require("mongoose");
const Product = require("../models/Product");
const { callViaGateway } = require("../helpers/gatewayFunc");

// POST /products
const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({
        message: "Name, price, and stock are required",
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      price,
      stock,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// GET /products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// GET /products/:id
const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// PUT /products/:id
const updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Case 1: Order service sends quantity to reduce stock
    if (quantity !== undefined) {
      if (quantity <= 0) {
        return res.status(400).json({
          message: "Quantity must be greater than 0",
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          message: "Insufficient stock",
        });
      }

      product.stock = product.stock - quantity;
      await product.save();

      // Low stock alert
      if (product.stock < Number(process.env.LOW_STOCK_THRESHOLD || 5)) {
        try {
          await callViaGateway(
            "POST",
            "/notification/send",
            {
              message: `Low stock alert: ${product.name} has only ${product.stock} items left`,
              productId: product._id,
              type: "LOW_STOCK",
            },
            req.headers
          );
        } catch (notifyError) {
          console.error("Low stock notification failed:", notifyError.message);
        }
      }

      return res.status(200).json({
        message: "Product stock reduced successfully",
        product,
      });
    }

    // Case 2: Normal update
    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.category = category ?? product.category;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;

    await product.save();

    // Low stock alert for normal stock update too
    if (product.stock < Number(process.env.LOW_STOCK_THRESHOLD || 5)) {
      try {
        await callViaGateway(
          "POST",
          "/notification/send",
          {
            message: `Low stock alert: ${product.name} has only ${product.stock} items left`,
            productId: product._id,
            type: "LOW_STOCK",
          },
          req.headers
        );
      } catch (notifyError) {
        console.error("Low stock notification failed:", notifyError.message);
      }
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// PATCH /products/:id/stock
const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined) {
      return res.status(400).json({
        message: "Stock value is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.stock = stock;
    await product.save();

    if (product.stock < Number(process.env.LOW_STOCK_THRESHOLD || 5)) {
      try {
        await callViaGateway(
          "POST",
          "/notification/send",
          {
            message: `Low stock alert: ${product.name} has only ${product.stock} items left`,
            productId: product._id,
            type: "LOW_STOCK",
          },
          req.headers
        );
      } catch (notifyError) {
        console.error("Low stock notification failed:", notifyError.message);
      }
    }

    return res.status(200).json({
      message: "Stock updated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update stock",
      error: error.message,
    });
  }
};

// POST /products/check-stock
const checkStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        message: "Product ID and quantity are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const available = product.stock >= quantity;

    return res.status(200).json({
      productId: product._id,
      productName: product.name,
      requestedQuantity: quantity,
      availableStock: product.stock,
      available,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to check stock",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateStock,
  checkStock,
};