import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Camera,
  History,
  Leaf,
  LoaderCircle,
  LogOut,
  Medal,
  Recycle,
  Settings,
  User,
  Zap,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const navigation = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: BarChart3,
  },
  {
    label: "Scan Waste",
    to: "/scan",
    icon: Camera,
  },
  {
    label: "History",
    to: "/history",
    icon: History,
  },
  {
    label: "Analytics",
    to: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Eco Impact",
    to: "/impact",
    icon: Leaf,
  },
  {
    label: "Gamification",
    to: "/gamification",
    icon: Medal,
  },
];

const secondaryNavigation = [
  {
    label: "Profile",
    to: "/profile",
    icon: User,
  },
  {
    label: "Settings",
    to: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside
      className="hidden min-h-screen w-[248px] shrink-0 flex-col border-r border-[#174f45] bg-[#033e35] text-white lg:flex"
      aria-label="Primary navigation"
    >
      {/* =====================================================
          BRAND
      ===================================================== */}
      <div className="px-5 pb-7 pt-6">
        <NavLink
          to="/"
          aria-label="ECO-SORT AI home"
          className="group flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#79d474] focus-visible:ring-offset-2 focus-visible:ring-offset-[#033e35]"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#087f5b] text-white shadow-[0_8px_22px_rgba(0,0,0,0.16)] transition-transform duration-200 group-hover:scale-[1.04]"
            aria-hidden="true"
          >
            <Recycle
              size={22}
              strokeWidth={2.2}
            />
          </div>

          <div className="min-w-0">
            <div className="text-[17px] font-black tracking-[-0.055em] text-white">
              ECO-SORT AI
            </div>

            <div className="mt-1 text-[8px] font-medium tracking-[0.02em] text-[#a8c9be]">
              Smart Waste. Green Future.
            </div>
          </div>
        </NavLink>
      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}
      <nav
        className="flex-1 px-3.5"
        aria-label="Dashboard navigation"
      >
        <p className="mb-2 px-3 text-[8px] font-black uppercase tracking-[0.16em] text-[#78c7ae]">
          Main Menu
        </p>

        <div className="space-y-1">
          {navigation.map((item) => (
            <SidebarLink
              key={item.to}
              {...item}
            />
          ))}
        </div>

        <div
          className="my-6 h-px bg-gradient-to-r from-transparent via-[#276358] to-transparent"
          aria-hidden="true"
        />

        <p className="mb-2 px-3 text-[8px] font-black uppercase tracking-[0.16em] text-[#78c7ae]">
          Account
        </p>

        <div className="space-y-1">
          {secondaryNavigation.map((item) => (
            <SidebarLink
              key={item.to}
              {...item}
            />
          ))}
        </div>
      </nav>

      {/* =====================================================
          USER INFO
      ===================================================== */}
      <div className="px-3.5 pb-2">
        <div className="rounded-xl border border-[#1d5a4e] bg-[#07372f] px-3.5 py-3 shadow-sm">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0b7658] text-[10px] font-black text-[#d8f7e8]"
              aria-hidden="true"
            >
              {(user?.name || "E")
                .trim()
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-[10px] font-black text-white">
                {user?.name || "Eco-Sort User"}
              </p>

              <p className="mt-0.5 truncate text-[8px] text-[#a6c7bd]">
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          CTA + SIGN OUT
      ===================================================== */}
      <div className="p-3.5 pt-2.5">
        <div className="relative overflow-hidden rounded-[18px] border border-[#15594b] bg-[#062f29] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.1)]">
          <div
            className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#79d474]/10 blur-2xl"
            aria-hidden="true"
          />

          <div
            className="absolute -bottom-10 -left-8 h-20 w-20 rounded-full bg-[#087f5b]/20 blur-2xl"
            aria-hidden="true"
          />

          <div className="relative">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#176b59] shadow-sm"
              aria-hidden="true"
            >
              <Zap
                size={16}
                className="text-[#79d474]"
                fill="currentColor"
              />
            </div>

            <p className="mt-3.5 text-[11px] font-black text-white">
              Every Scan Counts!
            </p>

            <p className="mt-1 text-[8px] leading-4 text-[#a6c7bd]">
              Small sorting decisions create better
              environmental habits.
            </p>

            <NavLink
              to="/scan"
              className="mt-3.5 flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#087f5b] px-3 text-[9px] font-black text-white shadow-[0_6px_16px_rgba(8,127,91,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#079b68] hover:shadow-[0_9px_20px_rgba(8,127,91,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#79d474] focus-visible:ring-offset-2 focus-visible:ring-offset-[#062f29] active:translate-y-0"
            >
              <Camera
                size={13}
                aria-hidden="true"
              />
              Start Scanning
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-busy={loggingOut}
              className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#397266] px-3 text-[9px] font-bold text-[#c4d9d2] transition-all duration-200 hover:border-[#568a7d] hover:bg-[#104f46] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#79d474] focus-visible:ring-offset-2 focus-visible:ring-offset-[#062f29] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? (
                <>
                  <LoaderCircle
                    size={13}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  <span>Signing Out…</span>
                </>
              ) : (
                <>
                  <LogOut
                    size={13}
                    aria-hidden="true"
                  />
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 px-2 pb-1 text-[7px] leading-4 tracking-wide text-[#73988f]">
          ECO-SORT AI
          <br />
          Intelligent Waste Classification
        </div>
      </div>
    </aside>
  );
}

/* =========================================================
   SIDEBAR LINK
========================================================= */

function SidebarLink({
  label,
  to,
  icon: Icon,
}) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      className={({ isActive }) =>
        [
          "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[10px] font-bold outline-none transition-all duration-200",
          "focus-visible:ring-2 focus-visible:ring-[#79d474] focus-visible:ring-offset-2 focus-visible:ring-offset-[#033e35]",
          isActive
            ? "bg-[#087f5b] text-white shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
            : "text-[#c4d9d2] hover:bg-[#0a5146] hover:text-white hover:translate-x-0.5",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r-full bg-[#79d474]"
              aria-hidden="true"
            />
          )}

          <span
            className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
              isActive
                ? "bg-white/10"
                : "bg-transparent group-hover:bg-white/[0.06]",
            ].join(" ")}
          >
            <Icon
              size={16}
              strokeWidth={isActive ? 2.5 : 2}
              aria-hidden="true"
              className={
                isActive
                  ? "text-[#a4ed9d]"
                  : "text-[#8ebbb0] transition-colors group-hover:text-[#bce8cf]"
              }
            />
          </span>

          <span className="truncate">
            {label}
          </span>

          {isActive && (
            <span
              className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#79d474] shadow-[0_0_8px_rgba(121,212,116,0.55)]"
              aria-hidden="true"
            />
          )}
        </>
      )}
    </NavLink>
  );
}