import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HeartHandshake,
  LockKeyhole,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { api, errorMessage } from "../api";
import { saveSession, roleHome } from "../auth";
export default function Login() {
  const nav = useNavigate();
  const [role, setRole] = useState("PARENT");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      saveSession(data);
      nav(roleHome(data.role), { replace: true });
    } catch (err) {
      if (form.password === "demo123") {
        const demo =
          role === "ADMIN"
            ? {
                fullName: "System Admin",
                email: form.email || "admin@aashray.demo",
                role: "ADMIN",
              }
            : {
                  fullName: "Akash Battula",
                  email: form.email || "parent@aashray.demo",
                  role: "PARENT",
                };
        saveSession(demo);
        nav(roleHome(demo.role), { replace: true });
      } else
        setError(
          `${errorMessage(err)} Use password demo123 for frontend demo.`,
        );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div className="glow one" />
        <div className="glow two" />
        <div className="visual-content">
          <div className="logo-large">
            <HeartHandshake />
          </div>
          <span className="eyebrow light">
            A secure bridge to brighter futures
          </span>
          <h1>Every child deserves a loving home.</h1>
          <p>
            One compassionate platform for parents, social workers and
            administrators.
          </p>
          <div className="feature-pills">
            <span>
              <Sparkles /> Thoughtful workflows
            </span>
            <span>
              <LockKeyhole /> Secure records
            </span>
          </div>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-box">
          <div className="mobile-brand">
            <HeartHandshake />
            <b>Aashray</b>
          </div>
          <span className="eyebrow">Secure access</span>
          <h2>Sign in to your portal</h2>
          <p>Select a role and use your registered account.</p>
          <div className="role-tabs">
            {[
              ["PARENT", "Parent"],
              ["ADMIN", "Admin"],
            ].map(([v, l]) => (
              <button
                type="button"
                className={role === v ? "active" : ""}
                key={v}
                onClick={() => setRole(v)}
              >
                {l}
              </button>
            ))}
          </div>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={submit}>
            <label className="auth-field">
              <span>Email address</span>
              <div>
                <Mail />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </label>
            <label className="auth-field">
              <span>Password</span>
              <div>
                <LockKeyhole />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>
            </label>
            <button className="auth-submit" disabled={loading}>
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in <ArrowRight />
                </>
              )}
            </button>
          </form>
          <p className="demo-note">
            Frontend demo password: <b>demo123</b>
          </p>
          {role === "PARENT" && (
            <div className="auth-link">
              New parent? <Link to="/parent/register">Create account</Link>
            </div>
          )}
          {role === "ADMIN" && (
            <div className="auth-link">
              Need an administrator account?{" "}
              <Link to="/register">Register admin</Link>
            </div>
          )}
          <div className="auth-link">
            <Link to="/">Return to home page</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
