import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/authStore";
import { LangProvider } from "./store/langContext";

import Navbar              from "./components/shared/Navbar";
import Landing             from "./pages/Landing";
import Login               from "./components/auth/Login";
import Signup              from "./components/auth/Signup";
import DoctorDashboard     from "./components/dashboard/DoctorDashboard";
import PatientDashboard    from "./components/dashboard/PatientDashboard";
import Results             from "./components/dashboard/Results";
import TestPage            from "./pages/TestPage";

// ─── Route Guards ────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireDoctor({ children }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "doctor") return <Navigate to="/patient" replace />;
  return children;
}

function RequirePatient({ children }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "patient") return <Navigate to="/doctor" replace />;
  return children;
}

// ─── Layout wrapper (with Navbar) ───────────────────────────────────────────
function WithNav({ children }) {
  return (
    <>
      <Navbar />
      <main className="page-enter">{children}</main>
    </>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const { user } = useAuthStore();

  return (
    <LangProvider>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: "12px", fontFamily: "'DM Sans', sans-serif", fontSize: "14px" },
          success: { iconTheme: { primary: "#3b82f6", secondary: "#fff" } },
        }}
      />

      <Routes>
        {/* Public */}
        <Route path="/"       element={<Landing />} />
        <Route path="/login"  element={user ? <Navigate to={user.role === "doctor" ? "/doctor" : "/patient"} /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to={user.role === "doctor" ? "/doctor" : "/patient"} /> : <Signup />} />

        {/* Doctor */}
        <Route path="/doctor" element={
          <RequireDoctor>
            <WithNav><DoctorDashboard /></WithNav>
          </RequireDoctor>
        } />

        {/* Patient */}
        <Route path="/patient" element={
          <RequirePatient>
            <WithNav><PatientDashboard /></WithNav>
          </RequirePatient>
        } />

        {/* Test flow — no navbar to avoid distraction */}
        <Route path="/test/:sessionId" element={
          <RequireAuth><TestPage /></RequireAuth>
        } />

        {/* Results */}
        <Route path="/results/:sessionId" element={
          <RequireAuth>
            <WithNav><Results /></WithNav>
          </RequireAuth>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </LangProvider>
  );
}
