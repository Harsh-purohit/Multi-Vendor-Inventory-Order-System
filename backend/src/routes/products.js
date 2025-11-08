// src/routes/products.js
import express from "express";
const router = express.Router();
import Product from "../models/Product.js";
import Vendor from "../models/Vendor.js";

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().lean();
    // attach vendorName for convenience
    const vendorIds = [...new Set(products.map((p) => String(p.vendorId)))];
    const vendors = await Vendor.find({ _id: { $in: vendorIds } }).lean();
    const vmap = vendors.reduce((acc, v) => ((acc[v._id] = v.name), acc), {});
    const resProducts = products.map(
      (p) => ({ ...p, vendorName: vmap[p.vendorId] || "Unknown" })
    );
    res.json(resProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/products
router.post("/", async (req, res) => {
  try {
    const { vendorId, name, price, stockQty, description } = req.body;
    if (!vendorId || !name || !price || !stockQty) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const product = new Product({
      vendorId,
      name,
      price,
      stockQty,
      initialStock: stockQty,
      description,
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
