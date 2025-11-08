# Multi-Vendor Inventory & Order System

A full-stack application for managing products, vendors, and orders with real-time updates.

---

## Features

- User and vendor authentication (JWT)
- Product management (CRUD)
- Order placement and cancellation
- Vendor dashboard with sales summary
- Real-time stock updates via Socket.IO

---

## Project Structure

```
/backend   # Express.js, MongoDB, Socket.IO
/frontend  # React, Vite
```

---

## Prerequisites

- Node.js (v18+ recommended)
- npm
- MongoDB (local or cloud)

---

## Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   - Create a `.env` file in `/backend`:
     ```
     PORT=3000
     MONGO_URI=mongodb://localhost:27017/multivendor
     JWT_SECRET=your_jwt_secret
     JWT_EXPIRES_IN=7d
     ```

3. **Start the backend server:**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000`.

---

## Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the frontend dev server:**
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:5173` (or as shown in your terminal).

---

## Usage

- **Register/Login** as a user or vendor.
- **Browse products** and place orders.
- **Vendors** can view their dashboard at `/vendor/:vendorId`.
- **Users** can view their orders at `/orders/user/:userId/orders`.

---

## API Endpoints

- `POST /api/auth/register` — Register user/vendor
- `POST /api/auth/login` — Login
- `GET /api/products` — List products
- `POST /api/products` — Add product (vendor)
- `POST /api/orders` — Place order (user)
- `POST /api/orders/:id/cancel` — Cancel order (user)
- `GET /api/orders/user/:userId/orders` — Get user orders
- `GET /api/vendor/:vendorId/dashboard` — Vendor dashboard

---

## Notes

- Ensure MongoDB is running before starting the backend.
- Update API URLs in frontend if backend runs on a different port or host.
- For real-time features, both frontend and backend must be running.

---

## License

MIT
