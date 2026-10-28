import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "./api";

function Storage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/products`)
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.log("Error fetching storage data:", error);
      });
  }, []);

  return (
    <div className="products-page">

      <div className="page-header">
        <h1>Storage</h1>
        <p>View product locations within the warehouse.</p>
      </div>

      <div className="panel">

        <div className="panel-header">
          <div>
            <h2>Storage Locations</h2>
            <p>Products and their current warehouse locations</p>
          </div>
        </div>

        <table>

          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Location</th>
              <th>Available Stock</th>
            </tr>
          </thead>

          <tbody>

            {products.map((product) => (
              <tr key={product._id}>

                <td>{product.name}</td>

                <td>{product.category}</td>

                <td>
                  <strong>{product.location}</strong>
                </td>

                <td>{product.quantity}</td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Storage;