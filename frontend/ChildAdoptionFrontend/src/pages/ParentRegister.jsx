import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartHandshake, ArrowLeft } from "lucide-react";
import { Field, Button, Toast } from "../components/UI";
import { saveSession } from "../auth";
export default function ParentRegister() {
  const nav = useNavigate();
  const [toast, setToast] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    saveSession({
      fullName: `${f.get("firstName")} ${f.get("lastName")}`,
      email: f.get("email"),
      role: "PARENT",
    });
    setToast({ message: "Registration successful" });
    setTimeout(() => nav("/parent/dashboard"), 300);
  };
  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-top">
          <div className="mobile-brand">
            <HeartHandshake />
            <b>Aashray Parent Registration</b>
          </div>
          <Link to="/" className="back-link">
            <ArrowLeft size={16} /> Home
          </Link>
        </div>
        <h1>Create parent account</h1>
        <p className="muted-text">
          Your account starts with ACTIVE status. Complete the remaining profile
          after login.
        </p>
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field name="firstName" label="First name" required />
            <Field name="lastName" label="Last name" required />
            <Field name="email" label="Email" type="email" required />
            <Field name="phone" label="Phone number" required />
            <Field
              name="password"
              label="Password"
              type="password"
              minLength="8"
              required
            />
            <Field
              name="confirm"
              label="Confirm password"
              type="password"
              minLength="8"
              required
            />
          </div>
          <div className="register-actions">
            <Button>Create account</Button>
          </div>
        </form>
        <div className="auth-link">
          Already registered? <Link to="/login">Sign in</Link>
        </div>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
