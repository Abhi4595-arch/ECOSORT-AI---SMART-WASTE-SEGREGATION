import { Menu, Recycle, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();
  const mobileNavigationId = useId();

  useEffect(() => {
    setMobileMenu(false);
  }, [location.pathname, location.search, location.hash]);

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
    <div className="flex min-h-screen overflow-x-hidden bg-[#f5f8f6]">
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}
      <Sidebar />

      {/* =====================================================
          MAIN APPLICATION AREA
      ===================================================== */}
      <div className="min-w-0 flex-1">
        {/* ===================================================
            MOBILE HEADER
        =================================================== */}
        <header className="sticky top-0 z-40 flex h-[64px] items-center justify-between border-b border-[#dfe9e4] bg-white/95 px-4 shadow-[0_1px_8px_rgba(15,50,40,0.04)] backdrop-blur-xl sm:h-[70px] sm:px-5 lg:hidden">
          <NavLink
            to="/dashboard"
            aria-label="Go to dashboard"
            onClick={closeMobileMenu}
            className="flex min-w-0 items-center gap-2.5 rounded-xl outline-none transition-transform duration-200 hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-[#087f5b] focus-visible:ring-offset-2"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#087f5b] text-white shadow-[0_6px_16px_rgba(8,127,91,0.18)] sm:h-10 sm:w-10"
              aria-hidden="true"
            >
              <Recycle
                size={19}
                strokeWidth={2.3}
                className="sm:h-5 sm:w-5"
              />
            </div>

            <div className="min-w-0">
              <div className="truncate text-[14px] font-black tracking-[-0.04em] text-[#17352e] sm:text-[15px]">
                ECO-SORT AI
              </div>

              <div className="truncate text-[7px] font-medium tracking-wide text-[#71847c] sm:text-[8px]">
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
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dfe9e4] bg-white text-[#17352e] shadow-sm transition-all duration-200 hover:border-[#b9d0c5] hover:bg-[#f3faf6] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087f5b] focus-visible:ring-offset-2 active:scale-95"
          >
            {mobileMenu ? (
              <X
                size={20}
                strokeWidth={2.2}
                aria-hidden="true"
              />
            ) : (
              <Menu
                size={20}
                strokeWidth={2.2}
                aria-hidden="true"
              />
            )}
          </button>
        </header>

        {/* ===================================================
            MOBILE NAVIGATION
        =================================================== */}
        {mobileMenu && (
          <>
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={closeMobileMenu}
              className="fixed inset-0 top-[64px] z-40 cursor-default bg-[#062f25]/25 backdrop-blur-[2px] lg:hidden sm:top-[70px]"
            />

            <div
              id={mobileNavigationId}
              role="dialog"
              aria-label="Mobile navigation"
              aria-modal="true"
              className="fixed inset-x-0 top-[64px] z-50 max-h-[calc(100vh-64px)] overflow-y-auto border-b border-[#245c50] bg-[#033e35] p-3 shadow-[0_20px_45px_rgba(3,62,53,0.25)] animate-[ecoMobileMenu_220ms_cubic-bezier(0.22,1,0.36,1)] sm:top-[70px] sm:max-h-[calc(100vh-70px)] sm:p-4 lg:hidden"
            >
              <MobileNavigation onNavigate={closeMobileMenu} />
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
            `flex min-h-[46px] items-center rounded-xl px-3.5 py-3 text-[11px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#033e35] sm:min-h-0 sm:px-4 sm:py-3 ${
              isActive
                ? "bg-[#087f5b] text-white shadow-[0_6px_16px_rgba(0,0,0,0.14)]"
                : "text-[#b1cbc3] hover:bg-[#0a5146] hover:text-white hover:translate-x-0.5 active:bg-[#0a5146]"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}