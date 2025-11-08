import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getVendorDashboard } from "../api/api";

const VendorDashboardPage = () => {
  const { vendorId: paramVendorId } = useParams();
  const vendorId = paramVendorId || "456";
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await getVendorDashboard(vendorId);
      const data = res.data;
      setSummary(data || []);
    } catch (err) {
      alert(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [vendorId]);

  return (
    <div className="page">
      <h2>Vendor Dashboard</h2>
      {loading && <p>Loading…</p>}
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Total Orders</th>
            <th>Total Qty</th>
            <th>Total Revenue</th>
          </tr>
        </thead>
        <tbody>
          {summary.length === 0 && !loading && (
            <tr>
              <td colSpan="4">No sales yet</td>
            </tr>
          )}
          {summary.map((s) => (
            <tr key={s._id}>
              <td>{s.productName}</td>
              <td>{s.totalOrders}</td>
              <td>{s.totalQty}</td>
              <td>₹{s.totalRevenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VendorDashboardPage;
