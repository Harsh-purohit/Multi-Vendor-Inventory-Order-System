import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { authenticate } from "../middleware/auth.js";
import { getIO } from "../utils/socket.js";

const router = express.Router();

// POST /api/orders -> place order (authenticated)
router.post("/", authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { productId, qty } = req.body;
    const user = req.user;
    if (!productId || !qty || qty <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "productId and qty required" });
    }

    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Product not found" });
    }

    // Ensure enough stock
    if (product.stockQty < qty) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: `Insufficient stock. Only ${product.stockQty} left`,
      });
    }

    // decrement stock
    product.stockQty -= qty;
    await product.save({ session });

    const order = new Order({
      productId: product._id,
      vendorId: product.vendorId,
      userId: user._id,
      qty,
      unitPrice: product.price,
      totalPrice: product.price * qty,
      status: "PLACED",
    });
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    // broadcast stock update
    const io = getIO();
    if (io)
      io.emit("stockUpdated", {
        productId: String(product._id),
        stockQty: product.stockQty,
      });

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/orders/:id/cancel -> cancel (authenticated)
router.post("/:id/cancel", authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const orderId = req.params.id;
    const user = req.user;

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Order not found" });
    }
    if (String(order.userId) !== String(user._id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: "Forbidden" });
    }
    if (order.status !== "PLACED") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Order not cancellable" });
    }

    const product = await Product.findById(order.productId).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Product not found" });
    }

    // restore stock but do not exceed initialStock
    const attempted = product.stockQty + order.qty;
    product.stockQty = Math.min(
      product.initialStock || attempted,
      attempted
    );
    await product.save({ session });

    order.status = "CANCELLED";
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    // broadcast stock update
    const io = getIO();
    if (io)
      io.emit("stockUpdated", {
        productId: String(product._id),
        stockQty: product.stockQty,
      });

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/user/:userId/orders -> user orders (authenticated and allowed if same user or admin)
router.get("/user/:userId/orders", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    // allow only the owner or vendor? For simplicity, allow owner only
    if (String(req.user._id) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const orders = await Order.find({ userId })
      .populate("productId", "name")
      .sort({ createdAt: -1 })
      .lean();
    const result = orders.map((o) => ({
      _id: o._id,
      productName: o.productId?.name || "Unknown",
      qty: o.qty,
      totalPrice: o.totalPrice,
      status: o.status,
      orderTime: o.orderTime,
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
