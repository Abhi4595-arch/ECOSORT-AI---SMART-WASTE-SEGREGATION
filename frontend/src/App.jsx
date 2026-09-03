import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ScanWaste from "./pages/ScanWaste";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import EcoImpact from "./pages/EcoImpact";
import Gamification from "./pages/Gamification";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";


function Placeholder({ title }) {
  return (
    <div className="min-h-screen bg-[#f5f7f9] text-[#111c2c]">

      {/* HEADER */}
      <header className="border-b border-[#e3e8eb] bg-white">

        <div className="mx-auto flex h-[90px] max-w-[1450px] items-center justify-between px-6 lg:px-10">

          <a
            href="/"
            className="flex items-center gap-3"
          >

            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#079b59] text-white shadow-lg shadow-[#079b59]/20">
              <span className="text-2xl">
                ♧
              </span>
            </div>

            <div>

              <div className="text-xl font-black tracking-[-0.04em]">
                ECO-SORT AI
              </div>

              <div className="text-[10px] text-[#718092]">
                Smart Waste. Green Future.
              </div>

            </div>

          </a>


          <a
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-bold text-[#172333] transition hover:text-[#087443]"
          >
            ←
            Dashboard
          </a>

        </div>

      </header>


      {/* CONTENT */}

      <main className="flex min-h-[calc(100vh-90px)] items-center justify-center px-6">

        <div className="w-full max-w-lg rounded-[28px] border border-[#e1e7e9] bg-white px-10 py-12 text-center shadow-xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf8ef] text-2xl">
            🌱
          </div>


          <h1 className="mt-6 text-3xl font-black tracking-[-0.04em]">
            {title}
          </h1>


          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#718092]">
            This ECO-SORT AI module is being prepared.
            It will connect directly with your AI backend
            and provide useful environmental insights.
          </p>


          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <a
              href="/dashboard"
              className="rounded-xl border border-[#dce4e0] bg-white px-6 py-3 text-sm font-bold text-[#087443] transition hover:bg-[#f1f8f4]"
            >
              Dashboard
            </a>


            <a
              href="/scan"
              className="rounded-xl bg-[#087443] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#087443]/20 transition hover:bg-[#065f37]"
            >
              Start Scanning
            </a>

          </div>

        </div>

      </main>

    </div>
  );
}


export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ==================================================
            HOME
        ================================================== */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* ==================================================
            DASHBOARD
        ================================================== */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* ==================================================
            AI SCANNER
        ================================================== */}

        <Route
          path="/scan"
          element={<ScanWaste />}
        />


        {/* ==================================================
            SCAN HISTORY
        ================================================== */}

        <Route
          path="/history"
          element={<History />}
        />


        {/* ==================================================
            ANALYTICS
        ================================================== */}

        <Route
          path="/analytics"
          element={<Analytics />}
        />


        {/* ==================================================
            ECO IMPACT
        ================================================== */}

        <Route
          path="/impact"
          element={<EcoImpact />}
        />


        {/* ==================================================
            GAMIFICATION
        ================================================== */}

        <Route
          path="/gamification"
          element={<Gamification />}
        />


        {/* ==================================================
            PROFILE
        ================================================== */}

        <Route
          path="/profile"
          element={<Profile />}
        />


        {/* ==================================================
            SETTINGS
        ================================================== */}

        <Route
          path="/settings"
          element={<Settings />}
        />


        {/* ==================================================
            INVALID ROUTES
        ================================================== */}

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

    </BrowserRouter>

  );
}