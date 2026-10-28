import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "./api";

const USERS_API_URL = `${API_URL}/api/users`;

function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Warehouse Staff"
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`
    };
  };

  // Load users when the page opens
  useEffect(() => {
    let ignore = false;

    const loadUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(USERS_API_URL, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!ignore) {
          setUsers(response.data);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
              "Could not load users. Please log in as Admin."
          );
        }
      }
    };

    loadUsers();

    return () => {
      ignore = true;
    };
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value
    }));
  };

  // Add a new user
  const addUser = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      const response = await axios.post(
        USERS_API_URL,
        {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role
        },
        {
          headers: getAuthHeaders()
        }
      );

      // Add the returned user to the list
      setUsers((previousUsers) => [
        ...previousUsers,
        response.data
      ]);

      setForm({
        name: "",
        email: "",
        password: "",
        role: "Warehouse Staff"
      });

      setMessage("User added successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not add user. Please try again."
      );
    }
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Users</h1>
        <p>Manage warehouse users and their roles.</p>
      </div>

      <div className="panel product-form">
        <h2>Add User</h2>

        <form onSubmit={addUser}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password (minimum 6 characters)"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="Admin">Admin</option>
            <option value="Warehouse Staff">
              Warehouse Staff
            </option>
            <option value="Viewer">Viewer</option>
          </select>

          <button type="submit" className="add-btn">
            Add User
          </button>
        </form>

        {error && (
          <p className="error-message">{error}</p>
        )}

        {message && (
          <p className="success-message">{message}</p>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>User List</h2>
            <p>Authorized warehouse users</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className="badge stock-in">
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !error && (
          <p className="empty-message">
            No users added yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default Users;
