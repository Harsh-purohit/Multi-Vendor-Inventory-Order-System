import React, { useState } from "react";
import { placeOrder } from "../api/api";
// import socket from "../socket";

const PlaceOrderModal = ({ product, onClose, refresh }) => {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  // NOTE: replace this placeholder userId with real auth in production
  const userId = "123";

  const handleSubmit = async () => {
    if (!Number.isFinite(qty) || qty <= 0) {
      alert("Quantity must be at least 1");
      return;
    }
    if (qty > product.stockQty) {
      alert(`Only ${product.stockQty} left`);
      return;
    }
    setLoading(true);
    try {
      await placeOrder({ productId: product._id, userId, qty });
      // Optionally optimistic UI update: emit local update or rely on server's broadcast
      // We rely on server -> socket broadcast; but we'll call refresh to be safe.
      refresh();
      onClose();
      alert("Order placed!");
    } catch (err) {
      alert(err.message || "Failed to place order");
      // refresh product info if error likely due to stock
      refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" role="dialog">
      <div className="modal-content">
        <h3>Order: {product.name}</h3>
        <p className="muted">Vendor: {product.vendorName}</p>
        <p>Available: {product.stockQty}</p>

        <label>
          Qty
          <input
            type="number"
            min="1"
            max={product.stockQty}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            style={{ width: "80px", marginLeft: "8px" }}
          />
        </label>

        <div style={{ marginTop: "16px", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button onClick={onClose} disabled={loading}>Close</button>
          <button onClick={handleSubmit} disabled={loading || product.stockQty <= 0}>
            {loading ? "Placing..." : `Place Order (${qty} × ₹${product.price})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderModal;
