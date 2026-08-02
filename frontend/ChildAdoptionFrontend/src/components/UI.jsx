import React from "react";
import {
  LoaderCircle,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
export function PageHeader({
  eyebrow = "Administration",
  title,
  description,
  actions,
}) {
  return (
    <div className="page-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <div className="head-actions">{actions}</div>
    </div>
  );
}
export function Button({
  children,
  variant = "primary",
  loading = false,
  ...props
}) {
  return (
    <button
      className={`btn ${variant}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <LoaderCircle size={17} className="spin" /> : children}
    </button>
  );
}
export function Field({ label, error, name, id, ...props }) {
  const fieldId = id || name || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, "-") : undefined);
  return (
    <label className="field" htmlFor={fieldId}>
      {label && <span>{label}</span>}
      <input id={fieldId} name={name || fieldId} {...props} />
      {error && <small>{error}</small>}
    </label>
  );
}
export function SelectField({ label, name, id, children, ...props }) {
  const fieldId = id || name || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, "-") : undefined);
  return (
    <label className="field" htmlFor={fieldId}>
      {label && <span>{label}</span>}
      <select id={fieldId} name={name || fieldId} {...props}>{children}</select>
    </label>
  );
}
export function TextareaField({ label, name, id, ...props }) {
  const fieldId = id || name || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, "-") : undefined);
  return (
    <label className="field" htmlFor={fieldId}>
      {label && <span>{label}</span>}
      <textarea id={fieldId} name={name || fieldId} {...props} />
    </label>
  );
}
export function SearchBox({ value, onChange, placeholder = "Search...", name, id }) {
  const fieldId = id || name || "search-input";
  return (
    <div className="search-box">
      <Search size={17} />
      <input
        id={fieldId}
        name={name || fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
export function Status({ value }) {
  const key = (value || "UNKNOWN").toLowerCase().replaceAll("_", "-");
  return (
    <span className={`status ${key}`}>
      {(value || "Unknown").replaceAll("_", " ")}
    </span>
  );
}
export function Empty({
  title = "No records found",
  text = "Try adjusting the filters or add a new record.",
}) {
  return (
    <div className="empty">
      <div>♡</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading">
      <LoaderCircle className="spin" /> Loading...
    </div>
  );
}
export function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className={`modal ${wide ? "wide" : ""}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.type || "success"}`}>
      {toast.type === "error" ? <AlertCircle /> : <CheckCircle2 />}
      <span>{toast.message}</span>
      <button onClick={onClose}>
        <X size={15} />
      </button>
    </div>
  );
}
export function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}
