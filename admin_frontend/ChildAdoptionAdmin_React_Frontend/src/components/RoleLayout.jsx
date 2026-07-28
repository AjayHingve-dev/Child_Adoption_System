import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HeartHandshake,
  LayoutDashboard,
  UserRound,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Upload,
  BookOpen,
  Contact,
  KeyRound,
  Baby,
} from "lucide-react";
import { clearSession, getUser } from "../auth";

const parentLinks = [
  ["/parent/dashboard", LayoutDashboard, "Dashboard"],
  ["/parent/profile", UserRound, "My Profile"],
  ["/parent/documents", Upload, "Documents"],
  ["/parent/children", Baby, "Browse Children"],
  ["/parent/applications", ClipboardList, "My Applications"],
  ["/parent/adoption-record", BookOpen, "Adoption Record"],
  ["/parent/contact", Contact, "Contact Us"],
  ["/parent/security", KeyRound, "Change Password"],
];

export default function RoleLayout({ children }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const user = getUser();
  const logout = () => {
    clearSession();
    nav("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><HeartHandshake /></div>
          <div><b>Aashray</b><small>Parent Portal</small></div>
          <button className="mobile-close" onClick={() => setOpen(false)}><X /></button>
        </div>
        <nav>
          {parentLinks.map(([to, Icon, label]) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? "active" : "")}>
              <Icon size={19} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <NavLink to="/parent/profile" className="mini-profile profile-link">
            <div className="avatar">{user?.fullName?.[0] || "U"}</div>
            <div><strong>{user?.fullName || "User"}</strong><small>PARENT</small></div>
          </NavLink>
          <button className="logout" onClick={logout}><LogOut size={18} /> Sign out</button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(true)}><Menu /></button>
          <div className="top-title"><ShieldCheck size={19} /><span>Secure adoption journey portal</span></div>
          <div className="top-user"><span>{user?.email}</span><div className="avatar small">{user?.fullName?.[0] || "U"}</div></div>
        </header>
        <div className="content">{children}</div>
      </main>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
    </div>
  );
}
