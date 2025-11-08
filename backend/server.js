// server.js (root)
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import connectDB from "./src/db.js";
import authRoutes from "./src/routes/auth.js";
import productRoutes from "./src/routes/products.js";
import orderRoutes from "./src/routes/orders.js";
import vendorRoutes from "./src/routes/vendor.js";
import { setIO } from "./src/utils/socket.js";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// API prefix
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes); // has / and /:id/cancel and /user/:userId
// mount compatibility route to match frontend expectation
app.use(
  "/api/users",
  (req, res, next) => {
    if (req.path.match(/^\/[^\/]+\/orders/)) {
      // redirect /api/users/:userId/orders -> /api/orders/user/:userId
      const parts = req.path.split("/").filter(Boolean);
      const userId = parts[0];
      const newPath = `/user/${userId}`;
      req.url = newPath + (parts[1] ? "/" + parts.slice(1).join("/") : "");
    }
    next();
  },
  orderRoutes
);

app.use("/api/vendor", vendorRoutes);

// Socket.IO
const io = new Server(server, {
  cors: { origin: "*" },
});
setIO(io);

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);
  socket.on("disconnect", () => {
    console.log("Socket disconnected", socket.id);
  });
});

// start
const PORT = process.env.PORT || 3000;
connectDB(
  process.env.MONGO_URI ||
    "mongodb+srv://harshplay10_db_user:F7ALVpjOBfzBPw9B@cluster0.ahacxdt.mongodb.net/multi_vendor_inventory"
)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection error", err);
  });
