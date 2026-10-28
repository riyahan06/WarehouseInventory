import { useState } from "react";

function Settings({ role }) {
  const [notifications, setNotifications] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [saved, setSaved] = useState(false);

  const isAdmin = role === "Admin";
  const isWarehouseStaff = role === "Warehouse Staff";
  const isViewer = role === "Viewer";

  const canEditSettings = isAdmin || isWarehouseStaff;

  const roleInitial = isAdmin
    ? "A"
    : isWarehouseStaff
    ? "S"
    : isViewer
    ? "V"
    : "?";

  const roleDescription = isAdmin
    ? "You have full access to warehouse operations, products, inventory, storage, stock movements, dispatches, and user management."
    : isWarehouseStaff
    ? "You can manage warehouse products and perform inventory, stock movement, and dispatch operations. User management is restricted to administrators."
    : isViewer
    ? "You have read-only access to warehouse information. You can view products, inventory, storage locations, stock movements, and dispatch history, but cannot make changes."
    : "Your role could not be identified. Please contact an administrator.";

  const handleSave = () => {
    if (!canEditSettings) return;

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleThresholdChange = (e) => {
    const value = Number(e.target.value);

    if (value >= 1) {
      setLowStockThreshold(value);
    }
  };

  const permissions = [
    {
      name: "Products",
      icon: "▤",
      allowed: true,
    },
    {
      name: "Inventory",
      icon: "◫",
      allowed: true,
    },
    {
      name: "Storage",
      icon: "⌂",
      allowed: true,
    },
    {
      name: "Stock Movement",
      icon: "↔",
      allowed: true,
    },
    {
      name: "Dispatch",
      icon: "→",
      allowed: true,
    },
    {
      name: "User Management",
      icon: "♙",
      allowed: isAdmin,
    },
  ];

  return (
    <div className="settings-page">
      {/* HEADER */}

      <div className="settings-header">
        <div>
          <div className="breadcrumb">
            Warehouse / Settings
          </div>

          <h1>Settings</h1>

          <p>
            Manage system preferences, access and warehouse alerts.
          </p>
        </div>

        {canEditSettings && (
          <button
            type="button"
            className={`settings-save-btn ${
              saved ? "saved" : ""
            }`}
            onClick={handleSave}
          >
            {saved ? "✓ Changes Saved" : "Save Changes"}
          </button>
        )}
      </div>

      {/* SETTINGS CONTENT */}

      <div className="settings-layout">
        {/* LEFT COLUMN */}

        <div className="settings-main">
          {/* ACCOUNT & ROLE */}

          <section className="panel settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon profile-settings-icon">
                👤
              </div>

              <div>
                <h2>Account &amp; Role</h2>

                <p>
                  View your account role and access permissions.
                </p>
              </div>
            </div>

            <div className="role-selector-box">
              <div className="role-selector-content">
                <div className="role-avatar">
                  {roleInitial}
                </div>

                <div>
                  <span className="settings-label">
                    Logged-in role
                  </span>

                  <strong className="current-role-name">
                    {role || "Unknown"}
                  </strong>

                  <small>
                    {isAdmin
                      ? "Full warehouse administration access"
                      : isWarehouseStaff
                      ? "Operational warehouse access"
                      : isViewer
                      ? "Read-only warehouse access"
                      : "Access level unavailable"}
                  </small>
                </div>
              </div>
            </div>

            <div
              className={`role-description ${
                isAdmin
                  ? "admin-role"
                  : "staff-role"
              }`}
            >
              <div className="role-description-icon">
                {isAdmin ? "🛡" : isViewer ? "👁" : "✓"}
              </div>

              <div>
                <strong>
                  {isAdmin
                    ? "Administrator permissions"
                    : isWarehouseStaff
                    ? "Warehouse Staff permissions"
                    : isViewer
                    ? "Viewer permissions"
                    : "Unknown permissions"}
                </strong>

                <p>{roleDescription}</p>
              </div>
            </div>
          </section>

          {/* NOTIFICATIONS */}

          <section className="panel settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon">
                🔔
              </div>

              <div>
                <h2>Notifications</h2>

                <p>
                  Control alerts that appear in the warehouse system.
                </p>
              </div>
            </div>

            <div className="settings-option">
              <div className="settings-option-text">
                <strong>Warehouse Notifications</strong>

                <span>
                  Receive notifications for important warehouse
                  activity.
                </span>
              </div>

              {canEditSettings ? (
                <button
                  type="button"
                  className={`settings-toggle ${
                    notifications ? "active" : ""
                  }`}
                  onClick={() =>
                    setNotifications((current) => !current)
                  }
                  aria-label="Toggle warehouse notifications"
                  aria-pressed={notifications}
                >
                  <span />
                </button>
              ) : (
                <span className="permission-restricted">
                  Read Only
                </span>
              )}
            </div>

            <div className="settings-option">
              <div className="settings-option-text">
                <strong>Low Stock Alert</strong>

                <span>
                  Show an alert when stock falls below the selected
                  level.
                </span>
              </div>

              {canEditSettings ? (
                <div className="threshold-input">
                  <input
                    type="number"
                    min="1"
                    value={lowStockThreshold}
                    onChange={handleThresholdChange}
                    aria-label="Low stock threshold"
                  />

                  <span>units</span>
                </div>
              ) : (
                <strong>
                  {lowStockThreshold} units
                </strong>
              )}
            </div>
          </section>

          {/* WAREHOUSE INFORMATION */}

          <section className="panel settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon">
                🏢
              </div>

              <div>
                <h2>Warehouse Information</h2>

                <p>
                  Basic information about the current warehouse.
                </p>
              </div>
            </div>

            <div className="settings-form-grid">
              <div className="settings-input-group">
                <label>Warehouse Name</label>

                <div className="settings-readonly-input">
                  <span>▣</span>
                  Main Warehouse
                </div>
              </div>

              <div className="settings-input-group">
                <label>System Type</label>

                <div className="settings-readonly-input">
                  <span>◫</span>
                  Inventory Management
                </div>
              </div>

              <div className="settings-input-group">
                <label>Storage Type</label>

                <div className="settings-readonly-input">
                  <span>⌂</span>
                  Main Storage Facility
                </div>
              </div>

              <div className="settings-input-group">
                <label>Status</label>

                <div className="settings-readonly-input status-input">
                  <span className="status-dot" />
                  Operational
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}

        <div className="settings-sidebar">
          {/* ACCESS SUMMARY */}

          <section className="panel settings-side-card">
            <div className="settings-side-header">
              <div className="settings-side-icon">
                🔐
              </div>

              <div>
                <h2>Access &amp; Permissions</h2>

                <p>Current role access</p>
              </div>
            </div>

            <div className="access-role">
              <div className="access-role-avatar">
                {roleInitial}
              </div>

              <div>
                <span>Signed in as</span>

                <strong>{role || "Unknown"}</strong>
              </div>
            </div>

            <div className="permission-list">
              {permissions.map((permission) => (
                <div
                  className="permission-row"
                  key={permission.name}
                >
                  <span>
                    <span className="permission-icon">
                      {permission.icon}
                    </span>

                    {permission.name}
                  </span>

                  <span
                    className={
                      permission.name === "User Management"
                        ? permission.allowed
                          ? "permission-admin"
                          : "permission-restricted"
                        : "permission-available"
                    }
                  >
                    {permission.name === "User Management"
                      ? permission.allowed
                        ? "Admin Only"
                        : "Restricted"
                      : isViewer
                      ? "View Only"
                      : "Available"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* CURRENT ROLE */}

          <section className="panel role-summary-card">
            <div className="role-summary-top">
              <div className="role-summary-icon">
                {isAdmin ? "🛡" : isViewer ? "👁" : "👤"}
              </div>

              <div>
                <span>CURRENT ROLE</span>

                <strong>{role || "Unknown"}</strong>
              </div>
            </div>

            <div className="role-summary-divider" />

            <p>
              {isAdmin
                ? "Administrator mode provides full access to warehouse modules and user management."
                : isWarehouseStaff
                ? "Warehouse Staff mode supports daily warehouse operations without user administration."
                : isViewer
                ? "Viewer mode provides read-only access to warehouse information. Changes are not permitted."
                : "Your access permissions are unavailable. Contact an administrator."}
            </p>
          </section>

          {/* SYSTEM INFORMATION */}

          <section className="panel settings-side-card">
            <div className="settings-side-header">
              <div className="settings-side-icon">
                ℹ
              </div>

              <div>
                <h2>System Information</h2>

                <p>Application details</p>
              </div>
            </div>

            <div className="system-details">
              <div>
                <span>Application</span>

                <strong>
                  Warehouse Inventory System
                </strong>
              </div>

              <div>
                <span>Version</span>

                <strong>1.0.0</strong>
              </div>

              <div>
                <span>Database</span>

                <strong>MongoDB Atlas</strong>
              </div>

              <div>
                <span>Environment</span>

                <strong className="environment-status">
                  <i />
                  Connected
                </strong>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Settings;