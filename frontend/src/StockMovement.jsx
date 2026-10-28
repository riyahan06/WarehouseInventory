import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "./api";

function StockMovement({ role = "Viewer" }) {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    product: "",
    type: "Stock In",
    quantity: ""
  });

  const canRecordMovement =
    role === "Admin" || role === "Warehouse Staff";

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      axios.get(`${API_URL}/api/products`),
      axios.get(`${API_URL}/api/movements`)
    ])
      .then(([productsResponse, movementsResponse]) => {
        if (!cancelled) {
          setProducts(productsResponse.data);
          setMovements(movementsResponse.data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Error loading stock movements:", error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshMovements = async () => {
    try {
      const [productsResponse, movementsResponse] =
        await Promise.all([
          axios.get(`${API_URL}/api/products`),
          axios.get(`${API_URL}/api/movements`)
        ]);

      setProducts(productsResponse.data);
      setMovements(movementsResponse.data);
    } catch (error) {
      console.error("Error refreshing movements:", error);

      alert(
        error.response?.data?.message ||
          "Could not refresh stock movement history."
      );
    }
  };

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value
    }));
  };

  const addMovement = async (e) => {
    e.preventDefault();

    if (!canRecordMovement) {
      alert("You do not have permission to record stock movements.");
      return;
    }

    if (!form.product || !form.quantity) {
      alert("Please fill all fields.");
      return;
    }

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      alert("Quantity must be a whole number greater than zero.");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/movements`, {
        product: form.product,
        type: form.type,
        quantity
      });

      setForm({
        product: "",
        type: "Stock In",
        quantity: ""
      });

      await refreshMovements();
      alert("Stock movement recorded successfully.");
    } catch (error) {
      console.error("Error adding movement:", error);

      alert(
        error.response?.data?.message ||
          "Could not record the stock movement."
      );
    }
  };

  return (
    <div className="products-page movement-page">
      <div className="page-header">
        <h1>Stock Movement</h1>
        <p>
          Record incoming and outgoing warehouse stock.
        </p>
      </div>

      {canRecordMovement && (
        <div className="panel product-form">
          <div className="panel-header">
            <div>
              <h2>Record Stock Movement</h2>
              <p>Add incoming or outgoing inventory</p>
            </div>
          </div>

          <form onSubmit={addMovement}>
            <select
              name="product"
              value={form.product}
              onChange={handleChange}
              required
            >
              <option value="">Select Product</option>

              {products.map((product) => (
                <option
                  key={product._id}
                  value={product.name}
                >
                  {product.name}
                </option>
              ))}
            </select>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
            >
              <option value="Stock In">Stock In</option>
              <option value="Stock Out">Stock Out</option>
            </select>

            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              min="1"
              step="1"
              required
            />

            <button type="submit" className="add-btn">
              Record Movement
            </button>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Movement History</h2>
            <p>Recent stock transactions</p>
          </div>

          <span className="product-count">
            {movements.length} Records
          </span>
        </div>

        <div className="table-container">
          <table className="movement-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {movements.map((movement) => (
                <tr key={movement._id}>
                  <td>
                    <div className="product-cell">
                      <span className="product-icon">📦</span>
                      <strong>{movement.product}</strong>
                    </div>
                  </td>

                  <td>
                    <span
                      className={
                        movement.type === "Stock In"
                          ? "badge stock-in"
                          : "badge stock-out"
                      }
                    >
                      {movement.type}
                    </span>
                  </td>

                  <td>
                    <strong
                      className={
                        movement.type === "Stock In"
                          ? "quantity-positive"
                          : "quantity-negative"
                      }
                    >
                      {movement.type === "Stock In"
                        ? `+${movement.quantity}`
                        : `−${movement.quantity}`}
                    </strong>
                  </td>

                  <td>
                    <span className="table-date">
                      {movement.date
                        ? new Date(
                            movement.date
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })
                        : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {movements.length === 0 && (
            <div className="empty-message">
              No stock movements recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StockMovement;
