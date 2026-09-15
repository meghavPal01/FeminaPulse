import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Landing from "./components/Landing";
import Auth from "./components/Auth";
import AppLayout from "./components/AppLayout";
import Dashboard from "./components/Dashboard";
import DailyLog from "./components/DailyLog";
import RiskCheck from "./components/RiskCheck";
import Recommendations from "./components/Recommendations";
import Knowledge from "./components/Knowledge";
import Profile from "./components/Profile";

function RequireAuth({ children }) {
  const { user, authReady } = useApp();

  // While we're checking a stored token against the backend, render nothing
  // rather than bouncing to /auth/login and immediately back.
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-[14px]">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/auth/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth/:mode" element={<Auth />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="log" element={<DailyLog />} />
        <Route path="risk" element={<RiskCheck />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="knowledge" element={<Knowledge />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
