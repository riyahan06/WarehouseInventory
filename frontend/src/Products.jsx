import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "./api";

function Products({ role = "Viewer" }) {
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
    location: ""
  });

  const isAdmin = role === "Admin";
  const isWarehouseStaff = role === "Warehouse Staff";
  const canManageProducts = isAdmin || isWarehouseStaff;

  // Fetch products from the backend
  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/products`
        );

        if (!cancelled) {
          setProducts(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching products:", error);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh the product list after a change
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/products`
      );

      setProducts(response.data);
    } catch (error) {
      console.error("Error refreshing products:", error);

      alert(
        error.response?.data?.message ||
          "Could not refresh the product list."
      );
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value
    }));
  };

  // Add a product
  const addProduct = async (e) => {
    e.preventDefault();

    if (!canManageProducts) {
      alert("You do not have permission to add products.");
      return;
    }

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity < 0) {
      alert("Quantity must be a whole number greater than or equal to zero.");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/products`,
        {
          name: form.name.trim(),
          category: form.category.trim(),
          quantity,
          location: form.location.trim()
        }
      );

      alert("Product added successfully!");

      setForm({
        name: "",
        category: "",
        quantity: "",
        location: ""
      });

      await fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);

      alert(
        error.response?.data?.message ||
          "Could not add product. Please check the backend server."
      );
    }
  };

  // Delete a product
  const deleteProduct = async (id) => {
    if (!canManageProducts) {
      alert("You do not have permission to delete products.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/products/${id}`
      );

      await fetchProducts();

      alert("Product deleted successfully.");
    } catch (error) {
      console.error("Error deleting product:", error);

      alert(
        error.response?.data?.message ||
          "Could not delete product."
      );
    }
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage warehouse products and their details.</p>
        </div>
      </div>

      {/* Add Product Form */}
      {canManageProducts && (
        <div className="panel product-form">
          <h2>Add Product</h2>

          <form onSubmit={addProduct}>
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              min="0"
              step="1"
              required
            />

            <input
              type="text"
              name="location"
              placeholder="Storage Location"
              value={form.location}
              onChange={handleChange}
              required
            />

            <button type="submit" className="add-btn">
              Add Product
            </button>
          </form>
        </div>
      )}

      {/* Product List */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Product List</h2>
            <p>Products currently stored in the warehouse</p>
          </div>

          <span className="product-count">
            {products.length} Products
          </span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Location</th>
                {canManageProducts && <th>Action</th>}
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.quantity}</td>
                  <td>{product.location}</td>

                  {canManageProducts && (
                    <td>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => deleteProduct(product._id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <p className="empty-message">
            No products found.
          </p>
        )}
      </div>
    </div>
  );
}

export default Products;
