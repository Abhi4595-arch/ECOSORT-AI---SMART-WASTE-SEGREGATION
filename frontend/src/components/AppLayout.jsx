import { Menu, Recycle, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

import Sidebar from "./Sidebar";


export default function AppLayout({ children }) {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f7f9]">

      {/* DESKTOP SIDEBAR */}

      <Sidebar />


      {/* MAIN AREA */}

      <div className="min-w-0 flex-1">

        {/* MOBILE HEADER */}

        <header className="sticky top-0 z-40 flex h-[70px] items-center justify-between border-b border-[#e3e8eb] bg-white px-5 lg:hidden">

          <NavLink
            to="/"
            className="flex items-center gap-2"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#079b59] text-white">

              <Recycle size={20} />

            </div>

            <div>

              <div className="text-[15px] font-black tracking-[-0.04em]">
                ECO-SORT AI
              </div>

              <div className="text-[7px] text-[#718092]">
                Smart Waste. Green Future.
              </div>

            </div>

          </NavLink>


          <button
            type="button"
            onClick={() =>
              setMobileMenu(!mobileMenu)
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfe6e2] bg-white text-[#17372f]"
          >

            {mobileMenu ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}

          </button>

        </header>


        {/* MOBILE MENU */}

        {mobileMenu && (
          <div className="fixed inset-x-0 top-[70px] z-50 border-b border-[#dce5e1] bg-[#033e35] p-4 shadow-xl lg:hidden">

            <MobileNavigation
              onNavigate={() =>
                setMobileMenu(false)
              }
            />

          </div>
        )}


        {/* PAGE */}

        {children}

      </div>

    </div>
  );
}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function MobileNavigation({
  onNavigate,
}) {
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
    <nav className="space-y-1">

      {links.map(([label, to]) => (

        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `block rounded-xl px-4 py-3 text-[11px] font-bold ${
              isActive
                ? "bg-[#087f5b] text-white"
                : "text-[#a9c7bf] hover:bg-[#0a5146] hover:text-white"
            }`
          }
        >
          {label}
        </NavLink>

      ))}

    </nav>
  );
}