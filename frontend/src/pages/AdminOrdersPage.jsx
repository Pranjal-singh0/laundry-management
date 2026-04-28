import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import { apiRequest } from "../services/api";

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

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

  const updateOrderField = (orderId, field, value) => {
    setOrders((current) =>
      current.map((order) =>
        order._id === orderId
          ? {
              ...order,
              [field]: value,
            }
          : order
      )
    );
  };

  const saveOrderUpdate = async (order) => {
    setSavingId(order._id);
    setError("");

    try {
      const data = await apiRequest(`/api/orders/${order._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: order.status,
          paymentStatus: order.paymentStatus,
        }),
      });

      setOrders((current) =>
        current.map((item) => (item._id === order._id ? data.order : item))
      );
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSavingId("");
    }
  };

  if (loading) {
    return <Loader label="Loading admin orders" />;
  }

  return (
    <div className="grid" style={{ gap: "1.5rem" }}>
      <section className="page-header">
        <div>
          <h1>Admin Orders</h1>
          <p className="muted">
            Review all customer orders and update operational or payment status.
          </p>
        </div>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6)}</td>
                  <td>
                    <div>
                      <strong>{order.user?.name}</strong>
                      <div className="muted">{order.user?.email}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <StatusBadge value={order.status} />
                    </div>
                    <select
                      value={order.status}
                      onChange={(event) =>
                        updateOrderField(order._id, "status", event.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="picked">Picked</option>
                      <option value="washing">Washing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <StatusBadge value={order.paymentStatus} />
                    </div>
                    <select
                      value={order.paymentStatus}
                      onChange={(event) =>
                        updateOrderField(order._id, "paymentStatus", event.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  </td>
                  <td>Rs. {order.totalAmount}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => saveOrderUpdate(order)}
                      disabled={savingId === order._id}
                    >
                      {savingId === order._id ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminOrdersPage;
