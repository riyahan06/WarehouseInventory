import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "./api";

function Dispatch({ role = "Viewer" }) {
  const [dispatches, setDispatches] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    product: "",
    quantity: "",
    destination: ""
  });

  const canCreateDispatch =
    role === "Admin" || role === "Warehouse Staff";

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      axios.get(`${API_URL}/api/products`),
      axios.get(`${API_URL}/api/dispatches`)
    ])
      .then(([productsResponse, dispatchesResponse]) => {
        if (!cancelled) {
          setProducts(productsResponse.data);
          setDispatches(dispatchesResponse.data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Error fetching dispatch data:", error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshDispatches = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/dispatches`
      );

      setDispatches(response.data);
    } catch (error) {
      console.error("Error refreshing dispatches:", error);

      alert(
        error.response?.data?.message ||
          "Could not refresh dispatch history."
      );
    }
  };

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value
    }));
  };

  const addDispatch = async (e) => {
    e.preventDefault();

    if (!canCreateDispatch) {
      alert("You do not have permission to create dispatches.");
      return;
    }

    if (
      !form.product ||
      !form.quantity ||
      !form.destination.trim()
    ) {
      alert("Please fill all fields.");
      return;
    }

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      alert("Quantity must be a whole number greater than zero.");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/dispatches`, {
        product: form.product,
        quantity,
        destination: form.destination.trim()
      });

      setForm({
        product: "",
        quantity: "",
        destination: ""
      });

      await refreshDispatches();
      alert("Dispatch created successfully.");
    } catch (error) {
      console.error("Error adding dispatch:", error);

      alert(
        error.response?.data?.message ||
          "Could not create dispatch. Please check the server."
      );
    }
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Dispatch</h1>
        <p>Manage products dispatched from the warehouse.</p>
      </div>

      {canCreateDispatch && (
        <div className="panel product-form">
          <h2>Create Dispatch</h2>

          <form onSubmit={addDispatch}>
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

            <input
              type="text"
              name="destination"
              placeholder="Destination"
              value={form.destination}
              onChange={handleChange}
              required
            />

            <button type="submit" className="add-btn">
              Create Dispatch
            </button>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Dispatch History</h2>
            <p>Recent warehouse dispatches</p>
          </div>

          <span className="product-count">
            {dispatches.length} Records
          </span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {dispatches.map((dispatch) => (
                <tr key={dispatch._id}>
                  <td>{dispatch.product}</td>
                  <td>{dispatch.quantity}</td>
                  <td>{dispatch.destination}</td>

                  <td>
                    <span className="badge stock-in">
                      {dispatch.status || "Pending"}
                    </span>
                  </td>

                  <td>
                    {dispatch.date
                      ? new Date(
                          dispatch.date
                        ).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {dispatches.length === 0 && (
          <p className="empty-message">
            No dispatches recorded yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default Dispatch;
