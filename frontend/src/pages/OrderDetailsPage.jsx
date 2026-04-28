import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import { apiRequest } from "../services/api";

function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await apiRequest(`/api/orders/${id}`, { method: "GET" });
        setOrder(data.order);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (loading) {
    return <Loader label="Loading order details" />;
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-error">{error}</div>
        <p style={{ marginTop: "1rem" }}>
          <Link className="inline-link" to="/orders">
            Back to orders
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: "1.5rem" }}>
      <section className="page-header">
        <div>
          <h1>Order #{order._id.slice(-6)}</h1>
          <p className="muted">Complete order summary and delivery information.</p>
        </div>
        <div className="button-row">
          <Link className="btn btn-secondary" to="/orders">
            Back to Orders
          </Link>
        </div>
      </section>

      <section className="grid grid-2">
        <div className="card">
          <h2>Status Summary</h2>
          <div className="detail-list">
            <div>
              <strong>Order status</strong>
              <StatusBadge value={order.status} />
            </div>
            <div>
              <strong>Payment status</strong>
              <StatusBadge value={order.paymentStatus} />
            </div>
            <div>
              <strong>Total amount</strong>
              <span className="muted">Rs. {order.totalAmount}</span>
            </div>
            <div>
              <strong>Pickup date</strong>
              <span className="muted">{new Date(order.pickupDate).toLocaleDateString()}</span>
            </div>
            <div>
              <strong>Delivery date</strong>
              <span className="muted">{new Date(order.deliveryDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Address and Notes</h2>
          <div className="detail-list">
            <div>
              <strong>Address</strong>
              <span className="muted">{order.address}</span>
            </div>
            <div>
              <strong>Notes</strong>
              <span className="muted">{order.notes || "No notes provided"}</span>
            </div>
            {order.user ? (
              <div>
                <strong>Customer</strong>
                <span className="muted">
                  {order.user.name} ({order.user.email})
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Items</h2>
        <div className="items-grid">
          {order.items.map((item, index) => (
            <div className="item-card" key={`${item.clothType}-${index}`}>
              <div className="detail-list">
                <div>
                  <strong>Cloth type</strong>
                  <span className="muted">{item.clothType}</span>
                </div>
                <div>
                  <strong>Service type</strong>
                  <span className="muted">{item.serviceType}</span>
                </div>
                <div>
                  <strong>Quantity</strong>
                  <span className="muted">{item.qty}</span>
                </div>
                <div>
                  <strong>Unit price</strong>
                  <span className="muted">Rs. {item.unitPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default OrderDetailsPage;
