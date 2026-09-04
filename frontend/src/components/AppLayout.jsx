import { Menu, Recycle, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();
  const mobileNavigationId = useId();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileMenu(false);
  }, [location.pathname, location.search, location.hash]);

  // Close the mobile drawer with the Escape key.
  useEffect(() => {
    if (!mobileMenu) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileMenu(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenu]);

  // Prevent the page behind the mobile drawer from scrolling.
  useEffect(() => {
    if (!mobileMenu) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenu]);

  const closeMobileMenu = () => {
    setMobileMenu(false);
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#f5f7f9]">
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}
      <Sidebar />

      {/* =====================================================
          MAIN AREA
      ===================================================== */}
      <div className="min-w-0 flex-1">
        {/* ===================================================
            MOBILE HEADER
        =================================================== */}
        <header className="sticky top-0 z-40 flex h-[64px] items-center justify-between border-b border-[#e3e8eb] bg-white/95 px-4 backdrop-blur-md sm:h-[70px] sm:px-5 lg:hidden">
          <NavLink
            to="/dashboard"
            aria-label="Go to dashboard"
            onClick={closeMobileMenu}
            className="flex min-w-0 items-center gap-2.5 rounded-lg outline-none transition focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#079b59] text-white shadow-sm sm:h-10 sm:w-10"
              aria-hidden="true"
            >
              <Recycle
                size={19}
                className="sm:h-5 sm:w-5"
              />
            </div>

            <div className="min-w-0">
              <div className="truncate text-[14px] font-black tracking-[-0.04em] text-[#17372f] sm:text-[15px]">
                ECO-SORT AI
              </div>

              <div className="truncate text-[7px] text-[#718092] sm:text-[8px]">
                Smart Waste. Green Future.
              </div>
            </div>
          </NavLink>

          <button
            type="button"
            aria-label={
              mobileMenu
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenu}
            aria-controls={mobileNavigationId}
            onClick={() => setMobileMenu((open) => !open)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dfe6e2] bg-white text-[#17372f] shadow-sm transition hover:border-[#b9d0c5] hover:bg-[#f7faf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087443] focus-visible:ring-offset-2 active:scale-95"
          >
            {mobileMenu ? (
              <X
                size={20}
                aria-hidden="true"
              />
            ) : (
              <Menu
                size={20}
                aria-hidden="true"
              />
            )}
          </button>
        </header>

        {/* ===================================================
            MOBILE MENU
        =================================================== */}
        {mobileMenu && (
          <>
            {/* Overlay */}
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={closeMobileMenu}
              className="fixed inset-0 top-[64px] z-40 cursor-default bg-black/20 backdrop-blur-[1px] sm:top-[70px] lg:hidden"
            />

            {/* Drawer */}
            <div
              id={mobileNavigationId}
              role="dialog"
              aria-label="Mobile navigation"
              aria-modal="true"
              className="fixed inset-x-0 top-[64px] z-50 max-h-[calc(100vh-64px)] overflow-y-auto border-b border-[#1a5b4d] bg-[#033e35] p-3 shadow-2xl sm:top-[70px] sm:max-h-[calc(100vh-70px)] sm:p-4 lg:hidden"
            >
              <MobileNavigation
                onNavigate={closeMobileMenu}
              />
            </div>
          </>
        )}

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}
        <main className="min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function MobileNavigation({ onNavigate }) {
  const links = [
    ["Dashboard", "/dashboard"],
    ["Scan Waste", "/scan"],
    ["History", "/history"],
    ["Analytics", "/analytics"],
    ["Eco Impact", "/impact"],
    ["Gamification", "/gamification"],
    ["Profile", "/profile"],
    ["Settings", "/settings"],
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:space-y-1"
    >
      {links.map(([label, to]) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex min-h-[46px] items-center rounded-xl px-3.5 py-3 text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#033e35] sm:min-h-0 sm:px-4 sm:py-3 ${
              isActive
                ? "bg-[#087f5b] text-white shadow-sm"
                : "text-[#a9c7bf] hover:bg-[#0a5146] hover:text-white active:bg-[#0a5146]"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}