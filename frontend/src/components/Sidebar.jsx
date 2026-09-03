import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Camera,
  History,
  Leaf,
  Medal,
  Recycle,
  Settings,
  User,
  Zap,
} from "lucide-react";


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
  return (
    <aside className="hidden min-h-screen w-[255px] shrink-0 flex-col bg-[#033e35] text-white lg:flex">

      {/* LOGO */}

      <div className="px-6 pb-7 pt-7">

        <NavLink
          to="/"
          className="flex items-center gap-3"
        >

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#079b59] shadow-lg shadow-black/10">
            <Recycle size={23} />
          </div>

          <div>

            <div className="text-[18px] font-black tracking-[-0.05em]">
              ECO-SORT AI
            </div>

            <div className="mt-0.5 text-[8px] font-medium text-[#9ec5b8]">
              Smart Waste. Green Future.
            </div>

          </div>

        </NavLink>

      </div>


      {/* NAVIGATION */}

      <nav className="flex-1 px-4">

        <p className="mb-3 px-3 text-[8px] font-black uppercase tracking-[0.15em] text-[#7fa99d]">
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


        <div className="my-6 h-px bg-[#286055]" />


        <p className="mb-3 px-3 text-[8px] font-black uppercase tracking-[0.15em] text-[#7fa99d]">
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


      {/* BOTTOM CARD */}

      <div className="p-4">

        <div className="relative overflow-hidden rounded-2xl border border-[#2d6359] bg-[#0b5145] p-5">

          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#72c96b]/10 blur-xl" />

          <div className="relative">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#176b59]">

              <Zap
                size={17}
                className="text-[#79d474]"
              />

            </div>

            <p className="mt-4 text-[11px] font-black">
              Every Scan Counts!
            </p>

            <p className="mt-1 text-[8px] leading-4 text-[#a6c7bd]">
              Small sorting decisions create
              better environmental habits.
            </p>

            <NavLink
              to="/scan"
              className="mt-4 flex items-center justify-center rounded-lg bg-[#079b59] px-3 py-2 text-[9px] font-bold transition hover:bg-[#08ad63]"
            >
              Start Scanning
            </NavLink>

          </div>

        </div>


        <div className="mt-5 px-2 text-[7px] leading-4 text-[#73988f]">
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
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-3 text-[10px] font-bold transition ${
          isActive
            ? "bg-[#087f5b] text-white shadow-lg shadow-black/10"
            : "text-[#a9c7bf] hover:bg-[#0a5146] hover:text-white"
        }`
      }
    >

      {({ isActive }) => (
        <>
          <Icon
            size={17}
            strokeWidth={isActive ? 2.4 : 2}
          />

          <span>
            {label}
          </span>
        </>
      )}

    </NavLink>
  );
}