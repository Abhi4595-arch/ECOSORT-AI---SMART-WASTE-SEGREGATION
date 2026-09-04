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
      className="eco-sidebar hidden min-h-screen w-[240px] shrink-0 flex-col bg-[#033e35] text-white lg:flex"
      aria-label="Primary navigation"
    >
      {/* =====================================================
          BRAND
      ===================================================== */}
      <div className="px-5 pb-7 pt-6">
        <NavLink
          to="/"
          aria-label="ECO-SORT AI home"
          className="flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#79d474] focus-visible:ring-offset-2 focus-visible:ring-offset-[#033e35]"
        >
          <div
            className="eco-brand-mark flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#079b59] text-white shadow-lg shadow-black/10"
            aria-hidden="true"
          >
            <Recycle size={21} />
          </div>

          <div className="min-w-0">
            <div className="text-[17px] font-black tracking-[-0.055em] text-white">
              ECO-SORT AI
            </div>

            <div className="mt-0.5 text-[8px] font-medium text-[#a8c9be]">
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
        <p className="mb-2 px-3 text-[8px] font-black uppercase tracking-[0.14em] text-[#78c7ae]">
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
          className="my-5 h-px bg-[#276358]"
          aria-hidden="true"
        />

        <p className="mb-2 px-3 text-[8px] font-black uppercase tracking-[0.14em] text-[#78c7ae]">
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
        <div className="eco-user-card rounded-xl border border-[#1d5a4e] bg-[#07372f] px-3.5 py-3">
          <p className="truncate text-[10px] font-black text-white">
            {user?.name || "Eco-Sort User"}
          </p>

          <p className="mt-0.5 truncate text-[8px] text-[#a6c7bd]">
            {user?.email || ""}
          </p>
        </div>
      </div>

      {/* =====================================================
          CTA + SIGN OUT
      ===================================================== */}
      <div className="p-3.5 pt-2.5">
        <div className="eco-sidebar-cta relative overflow-hidden rounded-[18px] border border-[#15594b] bg-[#062f29] p-4">
          <div
            className="absolute -right-7 -top-7 h-20 w-20 rounded-full bg-[#79d474]/10 blur-xl"
            aria-hidden="true"
          />

          <div className="relative">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#176b59]"
              aria-hidden="true"
            >
              <Zap
                size={16}
                className="text-[#79d474]"
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
              className="mt-3.5 flex min-h-10 items-center justify-center rounded-xl bg-[#079b59] px-3 text-[9px] font-black text-white transition hover:bg-[#08ad63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#79d474] focus-visible:ring-offset-2 focus-visible:ring-offset-[#062f29] active:scale-[0.99]"
            >
              Start Scanning
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-busy={loggingOut}
              className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#397266] px-3 text-[9px] font-bold text-[#c4d9d2] transition hover:bg-[#104f46] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#79d474] focus-visible:ring-offset-2 focus-visible:ring-offset-[#062f29] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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

        <div className="mt-4 px-2 text-[7px] leading-4 text-[#73988f]">
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
          "group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-[10px] font-bold transition",
          "outline-none focus-visible:ring-2 focus-visible:ring-[#79d474] focus-visible:ring-offset-2 focus-visible:ring-offset-[#033e35]",
          isActive
            ? "bg-[#0b7658] text-white shadow-sm"
            : "text-[#c4d9d2] hover:bg-[#0a5146] hover:text-white",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
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

          <span className="truncate">
            {label}
          </span>

          {isActive && (
            <span
              className="ml-auto h-1.5 w-1.5 rounded-full bg-[#79d474]"
              aria-hidden="true"
            />
          )}
        </>
      )}
    </NavLink>
  );
}