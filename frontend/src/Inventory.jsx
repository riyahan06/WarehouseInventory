import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "./api";

function Inventory({ role = "Viewer" }) {
  const [products, setProducts] = useState([]);
  const [adjustments, setAdjustments] = useState({});

  const canAdjustStock =
    role === "Admin" || role === "Warehouse Staff";

  useEffect(() => {
    let cancelled = false;

    axios
      .get(`${API_URL}/api/products`)
      .then((response) => {
        if (!cancelled) {
          setProducts(response.data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Error fetching inventory:", error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdjustmentChange = (id, value) => {
    setAdjustments((previous) => ({
      ...previous,
      [id]: value
    }));
  };

  const refreshInventory = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/products`
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error refreshing inventory:", error);
      alert(
        error.response?.data?.message ||
          "Could not refresh inventory."
      );
    }
  };

  const updateStock = async (id, currentQuantity, direction) => {
    if (!canAdjustStock) {
      alert("You do not have permission to adjust stock.");
      return;
    }

    const rawAmount = adjustments[id];

    if (
      rawAmount === undefined ||
      rawAmount === "" ||
      !Number.isInteger(Number(rawAmount)) ||
      Number(rawAmount) < 1
    ) {
      alert("Enter a whole number greater than zero.");
      return;
    }

    const amount = Number(rawAmount);
    const newQuantity =
      direction === "in"
        ? currentQuantity + amount
        : currentQuantity - amount;

    if (newQuantity < 0) {
      alert("Stock cannot be negative.");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/products/${id}`,
        { quantity: newQuantity }
      );

      setAdjustments((previous) => ({
        ...previous,
        [id]: ""
      }));

      await refreshInventory();
    } catch (error) {
      console.error("Error updating stock:", error);
      alert(
        error.response?.data?.message ||
          "Could not update stock."
      );
    }
  };

  return (
    <div className="products-page inventory-page">
      <div className="page-header">
        <h1>Inventory</h1>
        <p>Track stock quantities and availability.</p>
      </div>

      <div className="panel inventory-panel">
        <div className="panel-header">
          <div>
            <h2>Current Inventory</h2>
            <p>
              {canAdjustStock
                ? "Manage stock levels for warehouse products"
                : "View stock levels for warehouse products"}
            </p>
          </div>

          <span className="product-count">
            {products.length} Products
          </span>
        </div>

        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th className="inventory-product-column">Product</th>
                <th>Category</th>
                <th className="inventory-stock-column">
                  Current Stock
                </th>
                <th>Location</th>
                {canAdjustStock && (
                  <>
                    <th className="inventory-action-column">Stock In</th>
                    <th className="inventory-action-column">Stock Out</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const adjustment = adjustments[product._id] ?? "";

                return (
                  <tr key={product._id}>
                    <td>
                      <div className="inventory-product">
                        <div className="product-icon">
                          <span>▦</span>
                        </div>
                        <div className="product-info">
                          <strong>{product.name}</strong>
                          <small>Product</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="table-text">
                        {product.category || "—"}
                      </span>
                    </td>

                    <td>
                      <div className="stock-value">
                        <strong>{product.quantity}</strong>
                        <span>units</span>
                      </div>
                    </td>

                    <td>
                      <span className="table-text">
                        {product.location || "—"}
                      </span>
                    </td>

                    {canAdjustStock && (
                      <>
                        <td>
                          <div className="stock-adjustment">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              placeholder="Qty"
                              value={adjustment}
                              onChange={(e) =>
                                handleAdjustmentChange(
                                  product._id,
                                  e.target.value
                                )
                              }
                              aria-label={`Stock-in quantity for ${product.name}`}
                            />
                            <button
                              type="button"
                              className="stock-in-btn"
                              onClick={() =>
                                updateStock(
                                  product._id,
                                  Number(product.quantity || 0),
                                  "in"
                                )
                              }
                              title="Add stock"
                              aria-label={`Add stock to ${product.name}`}
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td>
                          <div className="stock-adjustment">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              placeholder="Qty"
                              value={adjustment}
                              onChange={(e) =>
                                handleAdjustmentChange(
                                  product._id,
                                  e.target.value
                                )
                              }
                              aria-label={`Stock-out quantity for ${product.name}`}
                            />
                            <button
                              type="button"
                              className="stock-out-btn"
                              onClick={() =>
                                updateStock(
                                  product._id,
                                  Number(product.quantity || 0),
                                  "out"
                                )
                              }
                              title="Remove stock"
                              aria-label={`Remove stock from ${product.name}`}
                            >
                              −
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="empty-message">
            No products available in inventory.
          </div>
        )}
      </div>
    </div>
  );
}

export default Inventory;
