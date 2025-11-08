// src/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, vendorName } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email & password required" });

    // If registering as vendor, create vendor record
    let vendorRef = null;
    if (role === "vendor") {
      const vendor = new Vendor({ name: vendorName || name, email });
      await vendor.save();
      vendorRef = vendor._id;
    }

    const hash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      passwordHash: hash,
      role: role || "user",
      vendorRef,
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorRef,
      },
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000)
      return res.status(400).json({ message: "Email already exists" });
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email & password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await user.verifyPassword(password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorRef: user.vendorRef,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
