import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/useAuth";
import { apiRequest } from "../services/api";

function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    apiRequest("/api/orders", { method: "GET" })
      .then((data) => {
        if (!ignore) {
          setOrders(data.orders);
        }
      })
      .catch((loadError) => {
        if (!ignore) {
          setError(loadError.message);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((order) => order.status === "pending").length;
    const completedOrders = orders.filter((order) =>
      ["ready", "delivered"].includes(order.status)
    ).length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    return { totalOrders, pendingOrders, completedOrders, totalRevenue };
  }, [orders]);

  if (loading) {
    return <Loader label="Loading dashboard" />;
  }

  return (
    <div className="grid" style={{ gap: "1.5rem" }}>
      <section className="page-header">
        <div>
          <h1>Hello, {user?.name}</h1>
          <p className="muted">
            {user?.role === "customer"
              ? "Track your laundry orders and submit new pickup requests."
              : "Monitor orders, payments, and service progress across customers."}
          </p>
        </div>
        <div className="button-row">
          <Link className="btn btn-primary" to="/orders">
            Manage Orders
          </Link>
          {["admin", "staff"].includes(user?.role) ? (
            <Link className="btn btn-secondary" to="/admin/orders">
              Open Admin Panel
            </Link>
          ) : null}
        </div>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="grid grid-3">
        <div className="card">
          <p className="muted">Total Orders</p>
          <div className="card-value">{stats.totalOrders}</div>
        </div>
        <div className="card">
          <p className="muted">Pending Orders</p>
          <div className="card-value">{stats.pendingOrders}</div>
        </div>
        <div className="card">
          <p className="muted">Completed Orders</p>
          <div className="card-value">{stats.completedOrders}</div>
        </div>
      </section>

      <section className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Recent Orders</h2>
              <p className="muted">Latest activity from your account.</p>
            </div>
          </div>
          {orders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Create your first laundry order to start tracking it from the dashboard."
              action={
                <Link className="btn btn-primary" to="/orders">
                  Create Order
                </Link>
              }
            />
          ) : (
            <div className="items-grid">
              {orders.slice(0, 3).map((order) => (
                <div className="item-card" key={order._id}>
                  <div className="card-header">
                    <div>
                      <strong>Order #{order._id.slice(-6)}</strong>
                      <p className="muted">Address: {order.address}</p>
                    </div>
                    <StatusBadge value={order.status} />
                  </div>
                  <p className="muted">Total: Rs. {order.totalAmount}</p>
                  <Link className="inline-link" to={`/orders/${order._id}`}>
                    View details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Overview</h2>
          <div className="detail-list">
            <div>
              <strong>Account role</strong>
              <span className="muted" style={{ textTransform: "capitalize" }}>
                {user?.role}
              </span>
            </div>
            <div>
              <strong>Estimated revenue</strong>
              <span className="muted">Rs. {stats.totalRevenue}</span>
            </div>
            <div>
              <strong>Recommended next step</strong>
              <span className="muted">
                {user?.role === "customer"
                  ? "Add a new order or review one of your existing orders."
                  : "Review pending orders and update status or payment progress."}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
