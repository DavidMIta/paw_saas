import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Layout from "./components/Layout";
import ClientLayout from "./components/ClientLayout";
import ClientBookingLayout from "./components/ClientBookingLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReservePage from "./pages/ReservePage";
import PublicBookingPage from "./pages/PublicBookingPage";
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import PetsPage from "./pages/PetsPage";
import AdminAppointmentsPage from "./pages/AdminAppointmentsPage";
import ClientDashboard from "./pages/ClientDashboard";
import ClientProfile from "./pages/ClientProfile";
import ClientPets from "./pages/ClientPets";
import StaffDashboard from "./pages/StaffDashboard";
import CreateUserPage from "./pages/CreateUserPage";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/book" element={<ClientBookingLayout />}>
            <Route index element={<PublicBookingPage />} />
          </Route>

          {/* Client protected routes */}
          <Route
            path="/client"
            element={
              <RoleProtectedRoute allowedRoles={["client"]}>
                <ClientLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<ClientDashboard />} />
            <Route path="reservations" element={<ClientDashboard />} />
            <Route path="pets" element={<ClientPets />} />
            <Route path="profile" element={<ClientProfile />} />
          </Route>

          {/* Staff protected routes */}
          <Route
            path="/staff"
            element={
              <RoleProtectedRoute allowedRoles={["staff"]}>
                <Layout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<StaffDashboard />} />
            <Route path="appointments" element={<StaffDashboard />} />
          </Route>

          {/* Admin/Owner protected routes */}
          <Route
            path="/"
            element={
              <RoleProtectedRoute allowedRoles={["owner", "super_admin"]}>
                <Layout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="reservar" element={<ReservePage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="pets" element={<PetsPage />} />
            <Route path="appointments" element={<AdminAppointmentsPage />} />
            <Route path="users" element={<CreateUserPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
