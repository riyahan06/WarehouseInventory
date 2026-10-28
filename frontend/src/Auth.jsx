
import { useState } from "react";
import axios from "axios";
import API_URL from "./api";

const USERS_API_URL = `${API_URL}/api/users`;

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState("Warehouse Staff");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/login" : "/register";
      const payload = isLogin
        ? {
            email: form.email.trim(),
            password: form.password,
            role: selectedRole,
          }
        : {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
          };

      const response = await axios.post(
        `${USERS_API_URL}${endpoint}`,
        payload
      );

      if (isLogin) {
        onLogin(response.data);
      } else {
        const registeredEmail = form.email.trim();
        setIsLogin(true);
        setForm({ name: "", email: registeredEmail, password: "" });
        setShowPassword(false);
        setError("");
        window.alert("Registration successful! Please log in.");
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin((previous) => !previous);
    setError("");
    setShowPassword(false);
    setSelectedRole("Warehouse Staff");
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <main className="auth-page auth-page-modern">
      <section
        className="auth-showcase"
        aria-label="Warehouse Inventory overview"
      >
        <div className="auth-showcase-brand">
          <div className="auth-showcase-logo">W</div>
          <span>Warehouse Inventory</span>
        </div>

        <div className="auth-showcase-copy">
          <span className="auth-eyebrow">
            WAREHOUSE MANAGEMENT, SIMPLIFIED
          </span>
          <h2>
            Everything in its place. Every stock movement in control.
          </h2>
          <p>
            Keep products organized, monitor stock levels, and manage warehouse
            operations from one clear workspace.
          </p>

          <div className="auth-benefits">
            <div className="auth-benefit">
              <span className="auth-benefit-icon" aria-hidden="true">
                ✓
              </span>
              <span>Real-time inventory visibility</span>
            </div>
            <div className="auth-benefit">
              <span className="auth-benefit-icon" aria-hidden="true">
                ✓
              </span>
              <span>Streamlined stock movement and dispatch</span>
            </div>
            <div className="auth-benefit">
              <span className="auth-benefit-icon" aria-hidden="true">
                ✓
              </span>
              <span>Access based on your assigned role</span>
            </div>
          </div>
        </div>

        <div className="auth-showcase-bottom">
          <div className="auth-warehouse-art" aria-hidden="true">
            <div className="auth-art-shelf auth-art-shelf-one">
              <i /><i /><i /><i />
            </div>
            <div className="auth-art-shelf auth-art-shelf-two">
              <i /><i /><i /><i /><i />
            </div>
            <div className="auth-art-floor" />
          </div>
          <span>One system. Better control.</span>
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-card auth-card-modern">
          <div className="auth-heading auth-heading-modern">
            <div className="auth-logo">W</div>
            <span className="auth-form-kicker">
              {isLogin ? "WELCOME BACK" : "GET STARTED"}
            </span>
            <h1>
              {isLogin ? "Sign in to your account" : "Create your account"}
            </h1>
            <p>
              {isLogin
                ? "Enter your details to access your workspace."
                : "Create a Warehouse Staff account to get started."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-modern">
            {isLogin && (
              <label className="auth-field">
                <span>Sign in as</span>
                <select
                  name="role"
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value)}
                  autoComplete="off"
                  required
                >
                  <option value="Admin">Admin</option>
                  <option value="Warehouse Staff">Warehouse Staff</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </label>
            )}

            {!isLogin && (
              <label className="auth-field">
                <span>Full name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label className="auth-field">
              <span>Email address</span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <div className="auth-password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={
                    isLogin ? "Enter your password" : "At least 6 characters"
                  }
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={
                    isLogin ? "current-password" : "new-password"
                  }
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {error && (
              <div className="auth-error auth-error-modern" role="alert">
                <span aria-hidden="true">!</span>
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="auth-submit auth-submit-modern"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign in"
                  : "Create account"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="auth-switch auth-switch-modern">
            {isLogin
              ? "Don't have an account yet?"
              : "Already have an account?"}{" "}
            <button type="button" onClick={switchMode}>
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </p>

          {!isLogin && (
            <p className="auth-note auth-note-modern">
              Public registration creates a Warehouse Staff account.
            </p>
          )}

          <div className="auth-secure-note">
            <span aria-hidden="true">●</span> Your workspace is protected by
            account sign-in
          </div>
        </div>
      </section>
    </main>
  );
}

export default Auth;
