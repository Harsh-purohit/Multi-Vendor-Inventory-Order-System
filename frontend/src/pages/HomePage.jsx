import React, { useEffect, useState } from "react";
import { getProducts } from "../api/api";
import socket from "../socket";
import PlaceOrderModal from "../components/PlaceOrderModal";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();

    // Listen for global stock updates
    socket.on("stockUpdated", ({ productId, stockQty }) => {
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, stockQty } : p))
      );
    });

    return () => {
      socket.off("stockUpdated");
    };
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      const data = res.products || res.data || res; // adjust based on actual structure
      setProducts(
        (Array.isArray(data) ? data : []).map((p) => ({
          vendorName: p.vendorName || p.vendorId || "Unknown",
          ...p,
        }))
      );
    } catch (err) {
      alert(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>Available Products</h2>
      {loading && <p>Loading products…</p>}
      <div className="grid">
        {products.map((p) => (
          <div key={p._id} className="card">
            <h3>{p.name}</h3>
            <p className="muted">Vendor: {p.vendorName}</p>
            <p>Price: ₹{p.price}</p>
            <p>Stock: {p.stockQty}</p>
            <button
              disabled={p.stockQty <= 0}
              onClick={() => setSelectedProduct(p)}
            >
              {p.stockQty <= 0 ? "Out of stock" : "Order"}
            </button>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <PlaceOrderModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          refresh={loadProducts}
        />
      )}
    </div>
  );
};

export default HomePage;
