import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PageLoading from "./components/PageLoading";

/* =========================================================
   LAZY-LOADED PAGES
========================================================= */

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const ScanWaste = lazy(() => import("./pages/ScanWaste"));
const History = lazy(() => import("./pages/History"));
const Analytics = lazy(() => import("./pages/Analytics"));
const EcoImpact = lazy(() => import("./pages/EcoImpact"));
const Gamification = lazy(() => import("./pages/Gamification"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));

/* =========================================================
   PROTECTED PAGE WRAPPER
========================================================= */

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

/* =========================================================
   ROUTE LOADING STATE
========================================================= */

function RouteFallback() {
  return (
    <PageLoading label="Loading page…" />
  );
}

/* =========================================================
   SCROLL RESTORATION
========================================================= */

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    /*
     * Every frontend page starts at the top when
     * navigation occurs.
     *
     * This prevents a long History/Analytics page from
     * opening halfway down after switching routes.
     */
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [
    location.pathname,
    location.search,
    location.hash,
  ]);

  return null;
}

/* =========================================================
   APPLICATION ROUTES
========================================================= */

function AppRoutes() {
  return (
    <>
      <ScrollToTop />

      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* =================================================
              PUBLIC ROUTES
          ================================================= */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* =================================================
              PROTECTED APPLICATION ROUTES
          ================================================= */}

          <Route
            path="/dashboard"
            element={
              <ProtectedPage>
                <Dashboard />
              </ProtectedPage>
            }
          />

          <Route
            path="/scan"
            element={
              <ProtectedPage>
                <ScanWaste />
              </ProtectedPage>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedPage>
                <History />
              </ProtectedPage>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedPage>
                <Analytics />
              </ProtectedPage>
            }
          />

          <Route
            path="/impact"
            element={
              <ProtectedPage>
                <EcoImpact />
              </ProtectedPage>
            }
          />

          <Route
            path="/gamification"
            element={
              <ProtectedPage>
                <Gamification />
              </ProtectedPage>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedPage>
                <Profile />
              </ProtectedPage>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedPage>
                <Settings />
              </ProtectedPage>
            }
          />

          {/* =================================================
              UNKNOWN ROUTES
          ================================================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}