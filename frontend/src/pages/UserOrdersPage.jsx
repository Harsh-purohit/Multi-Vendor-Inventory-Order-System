import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserOrders, cancelOrder } from "../api/api";

const UserOrdersPage = () => {
  const { userId: paramUserId } = useParams();
  const userId = paramUserId || "123"; // fallback mock user
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getUserOrders(userId);
      const data = res.data
      console.log(data);
      // Ensure productName present
      setOrders(
        (data || []).map((o) => ({
          productName: o.productName || "Unknown",
          ...o,
        }))
      );
    } catch (err) {
      alert(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [userId]);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await cancelOrder(orderId, userId);
      alert("Order cancelled");
      loadOrders();
    } catch (err) {
      alert(err.message || "Failed to cancel order");
    }
  };

  return (
    <div className="page">
      <h2>My Orders</h2>
      {loading && <p>Loading…</p>}
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && !loading && (
            <tr>
              <td colSpan="5">No orders yet</td>
            </tr>
          )}
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o.productName}</td>
              <td>{o.qty}</td>
              <td>₹{o.totalPrice}</td>
              <td>{o.status}</td>
              <td>
                {o.status === "PLACED" ? (
                  <button onClick={() => handleCancel(o._id)}>Cancel</button>
                ) : (
                  <span className="muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserOrdersPage;
