import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartHandshake, ArrowLeft, CheckCircle2 } from "lucide-react";
import { api, errorMessage } from "../api";

const initial = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
};

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const set = (key, value) => setForm({ ...form, [key]: value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", {
        firstName: form.firstName,
        lastName: form.lastName || null,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      setSuccess("Admin account created successfully. Redirecting to login...");
      setTimeout(() => nav("/login", { replace: true }), 700);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card admin-register">
        <div className="register-top">
          <Link to="/login" className="back-link">
            <ArrowLeft /> Back to login
          </Link>
          <div className="mobile-brand">
            <HeartHandshake />
            <b>Aashray</b>
          </div>
        </div>
        <span className="eyebrow">Administrator registration</span>
        <h1>Create an admin account</h1>
        <p>
          Enter only the required administrator details. The account will be
          created with the ADMIN role.
        </p>
        {error && <div className="form-error">{String(error)}</div>}
        {success && <div className="form-success">{success}</div>}
        <form onSubmit={submit}>
          <div className="form-grid">
            <label className="field">
              <span>First name *</span>
              <input
                maxLength="50"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Last name</span>
              <input
                maxLength="50"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
              />
            </label>
            <label className="field full">
              <span>Email *</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </label>
            <label className="field full">
              <span>Phone *</span>
              <input
                inputMode="numeric"
                minLength="10"
                maxLength="15"
                value={form.phone}
                onChange={(e) =>
                  set("phone", e.target.value.replace(/\D/g, ""))
                }
                required
              />
            </label>
            <label className="field">
              <span>Password *</span>
              <input
                type="password"
                minLength="8"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Confirm password *</span>
              <input
                type="password"
                minLength="8"
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                required
              />
            </label>
          </div>
          <p className="password-hint">
            Use at least 8 characters with uppercase, lowercase, number, and
            special character.
          </p>
          <div className="register-actions">
            <button className="btn primary" disabled={loading || !!success}>
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create admin account <CheckCircle2 />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
