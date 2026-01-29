import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth, RequireRole } from "./auth/RequireAuth";

import AuthLayout from "./layouts/AuthLayout";
import ClientLayout from "./layouts/ClientLayout";
import AdminLayout from "./layouts/AdminLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import ClientDashboard from "./pages/client/Dashboard";
import Vehicles from "./pages/client/Vehicles";
import Contracts from "./pages/client/Contracts";
import Accidents from "./pages/client/Accidents";
import AccidentCreate from "./pages/client/AccidentCreate";
import ClaimDetails from "./pages/client/ClaimDetails";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClaims from "./pages/admin/Claims";
import AdminClaimDetails from "./pages/admin/ClaimDetails";
import AdminContracts from "./pages/admin/Contracts";

export default function App() {
  return (
    <Routes>
      {/* AUTH */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ZONE PROTEGEE */}
      <Route element={<RequireAuth />}>
        {/* CLIENT */}
      <Route path="/client" element={<ClientLayout />}>
  <Route path="dashboard" element={<ClientDashboard />} />
  <Route path="vehicles" element={<Vehicles />} />
  <Route path="contracts" element={<Contracts />} />
  <Route path="accidents" element={<Accidents />} />
  <Route path="accidents/new" element={<AccidentCreate />} />
  <Route path="claims/:id" element={<ClaimDetails />} />
</Route>


        {/* ADMIN */}
      <Route path="/admin" element={<AdminLayout />}>
  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="claims" element={<AdminClaims />} />
  <Route path="claims/:id" element={<AdminClaimDetails />} />
  <Route path="contracts" element={<AdminContracts />} />
 
  <Route index element={<Navigate to="/admin/dashboard" replace />} />
</Route>

      </Route>

      {/* ROOT */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
