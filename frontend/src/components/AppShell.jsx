import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">Laundry Manager</div>

        <div className="topbar-actions">
          <nav className="topbar-nav">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              Dashboard
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              Orders
            </NavLink>
            {["admin", "staff"].includes(user?.role) ? (
              <NavLink
                to="/admin/orders"
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              >
                Admin Orders
              </NavLink>
            ) : null}
          </nav>

          <div className="user-chip">
            {user?.name} ({user?.role})
          </div>
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;
