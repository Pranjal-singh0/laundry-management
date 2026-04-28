import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    adminSetupKey: "",
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

    const payload =
      form.role === "customer"
        ? {
            name: form.name,
            email: form.email,
            password: form.password,
          }
        : form;

    try {
      await register(payload);
      navigate("/");
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
            <h1>Create account</h1>
            <p className="muted">
              Register a customer account or create admin and staff accounts with the setup key.
            </p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {error ? <div className="alert alert-error">{error}</div> : null}

          <div className="form-row">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

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
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {form.role !== "customer" ? (
            <div className="form-row">
              <label htmlFor="adminSetupKey">Admin setup key</label>
              <input
                id="adminSetupKey"
                name="adminSetupKey"
                type="password"
                placeholder="Enter the backend admin setup key"
                value={form.adminSetupKey}
                onChange={handleChange}
                required
              />
            </div>
          ) : null}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: "1rem" }}>
          Already have an account?{" "}
          <Link className="inline-link" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
