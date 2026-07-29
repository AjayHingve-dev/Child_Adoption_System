import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RoleLayout from "./components/RoleLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PublicHome from "./pages/PublicHome";
import ParentRegister from "./pages/ParentRegister";
import Dashboard from "./pages/Dashboard";
import Parents from "./pages/Parents";
import Children from "./pages/Children";
import Applications from "./pages/Applications";
import HomeVisits from "./pages/HomeVisits";
import SocialWorkers from "./pages/SocialWorkers";
import Admins from "./pages/Admins";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import {
  ParentDashboard,
  ParentProfile,
  ParentDocuments,
  ParentChildren,
  ParentApplications,
  AdoptionRecord,
  ParentContact,
  SecurityPage,
} from "./pages/ParentPages";
import { getUser, isAuthenticated, roleHome } from "./auth";

const Protected = ({ roles, children }) => {
  const user = getUser();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user?.role)) {
    const dest = roleHome(user?.role);
    return <Navigate to={dest} replace />;
  }
  return children;
};

const Admin = ({ children }) => (
  <Protected roles={["ADMIN", "SUPER_ADMIN", "SOCIAL_WORKER"]}>
    <Layout>{children}</Layout>
  </Protected>
);

const Parent = ({ children }) => (
  <Protected roles={["PARENT", "USER"]}>
    <RoleLayout>{children}</RoleLayout>
  </Protected>
);

const LoginRoute = () => {
  const user = getUser();
  if (isAuthenticated()) {
    return <Navigate to={roleHome(user?.role)} replace />;
  }
  return <Login />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicHome />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/register" element={<Register />} />
      <Route path="/parent/register" element={<ParentRegister />} />

      {[
        ["dashboard", <Dashboard />],
        ["profile", <Profile />],
        ["parents", <Parents />],
        ["children", <Children />],
        ["applications", <Applications />],
        ["home-visits", <HomeVisits />],
        ["social-workers", <SocialWorkers />],
        ["admins", <Admins />],
        ["reports", <Reports />],
        ["settings", <Settings />],
      ].map(([path, element]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={<Admin>{element}</Admin>}
        />
      ))}

      <Route path="/parent/dashboard" element={<Parent><ParentDashboard /></Parent>} />
      <Route path="/parent/profile" element={<Parent><ParentProfile /></Parent>} />
      <Route path="/parent/documents" element={<Parent><ParentDocuments /></Parent>} />
      <Route path="/parent/children" element={<Parent><ParentChildren /></Parent>} />
      <Route path="/parent/applications" element={<Parent><ParentApplications /></Parent>} />
      <Route path="/parent/adoption-record" element={<Parent><AdoptionRecord /></Parent>} />
      <Route path="/parent/contact" element={<Parent><ParentContact /></Parent>} />
      <Route path="/parent/security" element={<Parent><SecurityPage /></Parent>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
