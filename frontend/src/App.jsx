
import { useEffect, useState } from "react";
import axios from "axios";

import "./App.css";
import Products from "./Products";
import Inventory from "./Inventory";
import Storage from "./Storage";
import StockMovement from "./StockMovement";
import Dispatch from "./Dispatch";
import Users from "./Users";
import Settings from "./Settings";
import Auth from "./Auth";
import API_URL from "./api";

/* =========================
   ICONS
========================= */

const ProfileIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.5 3.2-5.5 7-5.5s6.2 2 7 5.5" />
  </svg>
);

const BellIcon = ({ size = 19 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    <path d="M10 21h4" />
  </svg>
);

const DashboardIcon = () => <span>▦</span>;
const ProductIcon = () => <span>▤</span>;
const InventoryIcon = () => <span>◫</span>;
const StorageIcon = () => <span>⌂</span>;
const MovementIcon = () => <span>↔</span>;
const DispatchIcon = () => <span>→</span>;
const UsersIcon = () => <span>♙</span>;
const SettingsIcon = () => <span>⚙</span>;

/* =========================
   PUBLIC LANDING PAGE
========================= */

function PublicLanding({ onLogin }) {
  const features = [
    {
      icon: "📦",
      title: "Product Management",
      description:
        "Organize product information and keep warehouse records in one place.",
    },
    {
      icon: "📊",
      title: "Inventory Tracking",
      description:
        "Monitor stock levels and identify items that need attention.",
    },
    {
      icon: "🏢",
      title: "Storage Management",
      description:
        "Keep warehouse storage information organized and accessible.",
    },
    {
      icon: "🔄",
      title: "Stock Movement",
      description:
        "Manage incoming and outgoing stock transactions.",
    },
    {
      icon: "🚚",
      title: "Dispatch Management",
      description:
        "Organize dispatch activities and outgoing products.",
    },
    {
      icon: "🔐",
      title: "Role-Based Access",
      description:
        "Provide different levels of access for administrators and staff.",
    },
  ];

  return (
    <div className="public-page">
      <header className="public-navbar">
        <div className="public-brand">
          <div className="public-brand-icon">W</div>
          <div>
            <h2>Warehouse Inventory</h2>
            <span>Management System</span>
          </div>
        </div>

        <button
          type="button"
          className="public-login-btn"
          onClick={onLogin}
        >
          <ProfileIcon size={19} />
          <span>Login / Register</span>
        </button>
      </header>

      <main>
        <section className="public-hero">
          <div className="public-hero-content">
            <span className="public-eyebrow">
              WAREHOUSE MANAGEMENT MADE SIMPLE
            </span>

            <h1>
              Manage Your Warehouse.
              <br />
              <span>Stay in Control.</span>
            </h1>

            <p>
              A centralized system to organize products, monitor
              inventory, manage storage, track stock movements,
              and coordinate dispatch operations.
            </p>

            <button
              type="button"
              className="public-primary-btn"
              onClick={onLogin}
            >
              Get Started <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="public-hero-visual">
            <div className="public-visual-icon">🏭</div>
            <h2>One System. Better Control.</h2>
            <p>Products · Inventory · Storage · Dispatch</p>
          </div>
        </section>

        <section className="public-features">
          <div className="public-section-heading">
            <span>WHAT YOU CAN DO</span>
            <h2>Everything your warehouse needs</h2>
            <p>
              Explore the main features of our inventory management
              system.
            </p>
          </div>

          <div className="public-feature-grid">
            {features.map((feature) => (
              <article
                className="public-feature-card"
                key={feature.title}
              >
                <div className="public-feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="public-footer">
        Warehouse Inventory Management System
        <span> · </span>
        Inventory organized, operations simplified.
      </footer>
    </div>
  );
}

/* =========================
   APP
========================= */

function App() {
  const [page, setPage] = useState("dashboard");
  const [showAuth, setShowAuth] = useState(false);

  /* =========================
     AUTHENTICATION
  ========================= */

  const [authUser, setAuthUser] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        return JSON.parse(savedUser);
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    return null;
  });

  const role = authUser?.role || "";
  const isAdmin = role === "Admin";
  const isWarehouseStaff = role === "Warehouse Staff";
  const canOperateWarehouse = isAdmin || isWarehouseStaff;

  // Attach the saved JWT to requests made by this shared Axios instance.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (authUser && token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, [authUser]);

  const handleLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setAuthUser(data.user);
    setShowAuth(false);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAuthUser(null);
    setShowAuth(false);
    setPage("dashboard");
    setShowNotifications(false);
  };

  /* =========================
     DASHBOARD DATA
  ========================= */

  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    availableStock: 0,
    lowStock: 0,
    dispatches: 0
  });

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Welcome",
      message: "Warehouse system is ready.",
      read: false
    }
  ]);

  const [showNotifications, setShowNotifications] =
    useState(false);

  /* =========================
     ROLE PERMISSIONS
  ========================= */

  const canAccess = {
    dashboard: true,
    products: true,
    inventory: true,
    storage: true,
    movement: true,
    dispatch: true,
    users: isAdmin,
    settings: isAdmin
  };

  /* =========================
     DASHBOARD DATA LOADING
  ========================= */

  useEffect(() => {
    if (!authUser || page !== "dashboard") return;

    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const [
          productsResponse,
          dispatchesResponse
        ] = await Promise.all([
          axios.get(`${API_URL}/api/products`),
          axios.get(`${API_URL}/api/dispatches`)
        ]);

        if (cancelled) return;

        const products = productsResponse.data;
        const dispatches = dispatchesResponse.data;

        const totalProducts = products.length;

        const availableStock = products.reduce(
          (total, product) =>
            total + Number(product.quantity || 0),
          0
        );

        const lowStock = products.filter(
          (product) => Number(product.quantity || 0) < 10
        ).length;

        setDashboardData({
          totalProducts,
          availableStock,
          lowStock,
          dispatches: dispatches.length
        });

        if (lowStock > 0) {
          setNotifications((previous) => {
            const alreadyExists = previous.some(
              (notification) => notification.id === "low-stock"
            );

            if (alreadyExists) {
              return previous;
            }

            return [
              {
                id: "low-stock",
                title: "Low stock alert",
                message: `${lowStock} product${
                  lowStock > 1 ? "s" : ""
                } need attention.`,
                read: false
              },
              ...previous
            ];
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error loading dashboard:", error);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [page, authUser]);

  /* =========================
     NAVIGATION
  ========================= */

  const goToPage = (targetPage) => {
    if (!canAccess[targetPage]) {
      setNotifications((previous) => [
        {
          id: Date.now(),
          title: "Access restricted",
          message:
            "This section is not available for your assigned role.",
          read: false
        },
        ...previous
      ]);

      setShowNotifications(true);
      return;
    }

    setPage(targetPage);
    setShowNotifications(false);
  };

  /* =========================
     NOTIFICATIONS
  ========================= */

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const toggleNotifications = () => {
    setShowNotifications((current) => !current);

    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true
      }))
    );
  };

  /* =========================
     SIDEBAR MENU
  ========================= */

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <DashboardIcon />
    },
    {
      id: "products",
      label: "Products",
      icon: <ProductIcon />
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: <InventoryIcon />
    },
    {
      id: "storage",
      label: "Storage",
      icon: <StorageIcon />
    },
    {
      id: "movement",
      label: "Stock Movement",
      icon: <MovementIcon />
    },
    {
      id: "dispatch",
      label: "Dispatch",
      icon: <DispatchIcon />
    }
  ];

  /* =========================
     PAGE CONTENT
  ========================= */

  const renderPage = () => {
    if (page === "products") {
      return <Products />;
    }

    if (page === "inventory") {
      return <Inventory />;
    }

    if (page === "storage") {
      return <Storage />;
    }

    if (page === "movement") {
      return <StockMovement />;
    }

    if (page === "dispatch") {
      return <Dispatch />;
    }

    /* USERS — ADMIN ONLY */

    if (page === "users") {
      if (!isAdmin) {
        return (
          <div className="products-page">
            <div className="panel">
              <div className="page-header">
                <h1>Access Restricted</h1>
                <p>
                  User management is available only to
                  administrators.
                </p>
              </div>

              <button
                className="add-btn"
                onClick={() => goToPage("dashboard")}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        );
      }

      return <Users />;
    }

    /* SETTINGS */

    if (page === "settings") {
      if (!isAdmin) {
        return (
          <div className="products-page">
            <div className="panel">
              <div className="page-header">
                <h1>Access Restricted</h1>
                <p>Settings are available only to administrators.</p>
              </div>
              <button className="add-btn" onClick={() => goToPage("dashboard")}>
                Return to Dashboard
              </button>
            </div>
          </div>
        );
      }
      return <Settings role={role} />;
    }

    /* =========================
       DASHBOARD
    ========================= */

    return (
      <>
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              Warehouse / Dashboard
            </div>

            <h1>Dashboard</h1>

            <p>
              Welcome back. Here's your warehouse overview.
            </p>
          </div>

          <div className="profile">
            {/* NOTIFICATIONS */}

            <div className="notification-wrapper">
              <button
                className="notification"
                onClick={toggleNotifications}
                aria-label="Notifications"
              >
                <BellIcon />

                {unreadCount > 0 && (
                  <span className="notification-dot">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-header">
                    <div>
                      <strong>Notifications</strong>
                      <small>Recent system updates</small>
                    </div>

                    <span>{notifications.length}</span>
                  </div>

                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="notification-empty">
                        You're all caught up.
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          className="notification-item"
                          key={notification.id}
                        >
                          <div className="notification-item-icon">
                            <BellIcon size={15} />
                          </div>

                          <div>
                            <strong>{notification.title}</strong>
                            <p>{notification.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CURRENT ROLE */}

            <div className="role-display">
              <span className="role-label">
                Current role
              </span>

              <strong>{role}</strong>
            </div>

            {/* PROFILE */}

            <div
              className="profile-avatar"
              title={`${role} profile`}
            >
              <ProfileIcon size={20} />
            </div>
          </div>
        </header>

        {/* SUMMARY CARDS */}

        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon">📦</div>

            <div>
              <p>Total Products</p>
              <h2>{dashboardData.totalProducts}</h2>
              <span>Products registered</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">◫</div>

            <div>
              <p>Available Stock</p>
              <h2>{dashboardData.availableStock}</h2>
              <span>Units currently available</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">!</div>

            <div>
              <p>Low Stock</p>
              <h2>{dashboardData.lowStock}</h2>
              <span>Need attention</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚚</div>

            <div>
              <p>Dispatches</p>
              <h2>{dashboardData.dispatches}</h2>
              <span>Total recorded</span>
            </div>
          </div>
        </section>

        {/* DASHBOARD CONTENT */}

        <section className="content-grid">
          {/* RECENT STOCK MOVEMENT */}

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Recent Stock Movement</h2>
                <p>Latest inventory transactions</p>
              </div>

              <button
                className="view-btn"
                onClick={() => goToPage("movement")}
              >
                View All →
              </button>
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
                  <tr>
                    <td>
                      <span className="product-cell">
                        <span className="product-icon">📦</span>
                        Laptop
                      </span>
                    </td>

                    <td>
                      <span className="badge stock-in">
                        Stock In
                      </span>
                    </td>

                    <td className="quantity-cell positive">
                      +50
                    </td>

                    <td>Today</td>
                  </tr>

                  <tr>
                    <td>
                      <span className="product-cell">
                        <span className="product-icon">📦</span>
                        Keyboard
                      </span>
                    </td>

                    <td>
                      <span className="badge stock-out">
                        Stock Out
                      </span>
                    </td>

                    <td className="quantity-cell negative">
                      -20
                    </td>

                    <td>Today</td>
                  </tr>

                  <tr>
                    <td>
                      <span className="product-cell">
                        <span className="product-icon">📦</span>
                        Monitor
                      </span>
                    </td>

                    <td>
                      <span className="badge stock-in">
                        Stock In
                      </span>
                    </td>

                    <td className="quantity-cell positive">
                      +30
                    </td>

                    <td>Yesterday</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* QUICK ACTIONS */}

          {canOperateWarehouse && <div className="panel quick-panel">
            <div className="panel-header">
              <div>
                <h2>Quick Actions</h2>
                <p>Common warehouse operations</p>
              </div>
            </div>

            <button
              className="action-btn"
              onClick={() => goToPage("products")}
            >
              <span className="action-icon">＋</span>

              <div>
                <strong>Add Product</strong>
                <small>Register a new product</small>
              </div>
            </button>

            <button
              className="action-btn"
              onClick={() => goToPage("movement")}
            >
              <span className="action-icon">↗</span>

              <div>
                <strong>Stock In</strong>
                <small>Record incoming stock</small>
              </div>
            </button>

            <button
              className="action-btn"
              onClick={() => goToPage("movement")}
            >
              <span className="action-icon">↘</span>

              <div>
                <strong>Stock Out</strong>
                <small>Record outgoing stock</small>
              </div>
            </button>

            <button
              className="action-btn"
              onClick={() => goToPage("dispatch")}
            >
              <span className="action-icon">→</span>

              <div>
                <strong>Create Dispatch</strong>
                <small>Send products from warehouse</small>
              </div>
            </button>
          </div>}
        </section>
      </>
    );
  };

  /* =========================
     SHOW LOGIN WHEN SIGNED OUT
  ========================= */

  if (!authUser && showAuth) {
    return <Auth onLogin={handleLogin} />;
  }

  if (!authUser) {
    return <PublicLanding onLogin={() => setShowAuth(true)} />;
  }

  /* =========================
     MAIN APP LAYOUT
  ========================= */

  return (
    <div className="app">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">W</div>

          <div>
            <h2>Warehouse</h2>
            <span>Inventory System</span>
          </div>
        </div>

        <nav>
          <p className="menu-title">MAIN MENU</p>

          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${
                page === item.id ? "active" : ""
              }`}
              onClick={() => goToPage(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <p className="menu-title">SYSTEM</p>

          {/* USERS — ADMIN ONLY */}

          {isAdmin && (
            <button
              className={`menu-item ${
                page === "users" ? "active" : ""
              }`}
              onClick={() => goToPage("users")}
            >
              <span>
                <UsersIcon />
              </span>

              Users
            </button>
          )}

          {/* SETTINGS — ADMIN ONLY */}
          {isAdmin && <button
            className={`menu-item ${
              page === "settings" ? "active" : ""
            }`}
            onClick={() => goToPage("settings")}
          >
            <span>
              <SettingsIcon />
            </span>

            Settings
          </button>}
        </nav>

        {/* LOGGED-IN USER */}

        <div className="user-box">
          <div className="avatar">
            <ProfileIcon size={18} />
          </div>

          <div className="user-info">
            <strong>
              {authUser?.name || "Warehouse User"}
            </strong>

            <small>{role}</small>
          </div>

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
