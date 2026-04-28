import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/useAuth";
import { apiRequest } from "../services/api";

const createEmptyItem = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  clothType: "",
  serviceType: "wash",
  qty: "",
  unitPrice: "",
});

function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    items: [createEmptyItem()],
    pickupDate: "",
    deliveryDate: "",
    address: "",
    notes: "",
  });

  const loadOrders = async () => {
    try {
      const data = await apiRequest("/api/orders", { method: "GET" });
      setOrders(data.orders);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleOrderFieldChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  };

  const addItem = () => {
    setForm((current) => ({
      ...current,
      items: [...current.items, createEmptyItem()],
    }));
  };

  const removeItem = (index) => {
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        items: form.items.map((item) => ({
          clothType: item.clothType,
          serviceType: item.serviceType,
          qty: Number(item.qty),
          unitPrice: Number(item.unitPrice),
        })),
      };

      await apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSuccess("Order created successfully.");
      setForm({
        items: [createEmptyItem()],
        pickupDate: "",
        deliveryDate: "",
        address: "",
        notes: "",
      });
      await loadOrders();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (orderId) => {
    const confirmed = window.confirm("Delete this order?");
    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/api/orders/${orderId}`, { method: "DELETE" });
      setOrders((current) => current.filter((order) => order._id !== orderId));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  if (loading) {
    return <Loader label="Loading orders" />;
  }

  return (
    <div className="grid" style={{ gap: "1.5rem" }}>
      <section className="page-header">
        <div>
          <h1>Orders</h1>
          <p className="muted">
            Create a new order, review delivery details, and manage your existing orders.
          </p>
        </div>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      {user?.role === "customer" ? (
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Create Order</h2>
              <p className="muted">Add service items and pickup details.</p>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="items-grid">
              {form.items.map((item, index) => (
                <div className="item-card" key={item.id}>
                  <div className="card-header">
                    <h3>Item {index + 1}</h3>
                    {form.items.length > 1 ? (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => removeItem(index)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>

                  <div className="grid grid-2">
                    <div className="form-row">
                      <label>Cloth type</label>
                      <input
                        value={item.clothType}
                        onChange={(event) =>
                          handleItemChange(index, "clothType", event.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="form-row">
                      <label>Service type</label>
                      <select
                        value={item.serviceType}
                        onChange={(event) =>
                          handleItemChange(index, "serviceType", event.target.value)
                        }
                      >
                        <option value="wash">Wash</option>
                        <option value="iron">Iron</option>
                        <option value="dry-clean">Dry clean</option>
                        <option value="wash-and-iron">Wash and iron</option>
                      </select>
                    </div>

                    <div className="form-row">
                      <label>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(event) => handleItemChange(index, "qty", event.target.value)}
                        placeholder="Enter quantity"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <label>Unit price</label>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(event) =>
                          handleItemChange(index, "unitPrice", event.target.value)
                        }
                        placeholder="Enter unit price"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="button-row">
              <button type="button" className="btn btn-secondary" onClick={addItem}>
                Add Item
              </button>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label htmlFor="pickupDate">Pickup date</label>
                <input
                  id="pickupDate"
                  name="pickupDate"
                  type="date"
                  value={form.pickupDate}
                  onChange={handleOrderFieldChange}
                  required
                />
              </div>

              <div className="form-row">
                <label htmlFor="deliveryDate">Delivery date</label>
                <input
                  id="deliveryDate"
                  name="deliveryDate"
                  type="date"
                  value={form.deliveryDate}
                  onChange={handleOrderFieldChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleOrderFieldChange}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleOrderFieldChange}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create Order"}
            </button>
          </form>
        </section>
      ) : null}

      <section className="card">
        <div className="card-header">
          <div>
            <h2>{user?.role === "customer" ? "My Orders" : "All Orders"}</h2>
            <p className="muted">
              {user?.role === "customer"
                ? "View the status of your current and past orders."
                : "As a privileged user, you can review all submitted orders here."}
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="Once an order is created, it will appear here."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-6)}</td>
                    <td>{order.user?.name || "You"}</td>
                    <td>
                      <StatusBadge value={order.status} />
                    </td>
                    <td>
                      <StatusBadge value={order.paymentStatus} />
                    </td>
                    <td>Rs. {order.totalAmount}</td>
                    <td>
                      <div className="button-row">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => navigate(`/orders/${order._id}`)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleDelete(order._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {user?.role !== "customer" ? (
        <p className="muted">
          Need to update statuses or payments? Use the{" "}
          <Link className="inline-link" to="/admin/orders">
            Admin Orders page
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}

export default OrdersPage;
