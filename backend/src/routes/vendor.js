// src/routes/vendor.js
import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = express.Router();

router.get("/:vendorId/dashboard", async (req, res) => {
  try {
    const { vendorId } = req.params;

    // ✅ Ensure vendorId format
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({ message: "Invalid vendorId format" });
    }

    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

    const pipeline = [
      { $match: { vendorId: vendorObjectId, status: "PLACED" } },
      {
        $group: {
          _id: "$productId",
          totalOrders: { $sum: 1 },
          totalQty: { $sum: "$qty" },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      {
        $lookup: {
          from: Product.collection.name, // dynamic collection name
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productName: "$product.name",
          totalOrders: 1,
          totalQty: 1,
          totalRevenue: 1,
        },
      },
    ];

    const result = await Order.aggregate(pipeline);
    res.json(result);
  } catch (err) {
    console.error("Vendor dashboard error:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

export default router;
