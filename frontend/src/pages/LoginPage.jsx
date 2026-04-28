import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "customer",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form);
      const redirectPath = location.state?.from?.pathname || "/";
      navigate(redirectPath);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <div className="page-header">
          <div>
            <h1>Welcome back</h1>
            <p className="muted">Sign in to manage laundry orders and payments.</p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {error ? <div className="alert alert-error">{error}</div> : null}

          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="role">Login as</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: "1rem" }}>
          Need an account?{" "}
          <Link className="inline-link" to="/register">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
