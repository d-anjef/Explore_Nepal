import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaCalendarCheck,
  FaBoxOpen,
  FaUsers,
  FaMoneyCheckAlt,
  FaStar,
  FaHistory,
  FaUserTie,
} from "react-icons/fa";

const navItems = [
  { label: "Home", path: "/admin", icon: FaHome },
  { label: "Bookings", path: "/admin/bookings", icon: FaCalendarCheck },
  { label: "Packages", path: "/admin/packages", icon: FaBoxOpen },
  { label: "Users", path: "/admin/users", icon: FaUsers },
  { label: "Payments", path: "/admin/payments", icon: FaMoneyCheckAlt },
  { label: "Ratings", path: "/admin/ratings", icon: FaStar },
  { label: "History", path: "/admin/history", icon: FaHistory },
  { label: "Guide Applications", path: "/admin/guide-applications", icon: FaUserTie },
];

/**
 * Shared layout wrapper for admin pages.
 *
 * Ensures a consistent background, horizontal padding and max-width
 * similar to the /admin (AdminHome) page.
 */
const AdminPageShell = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-full bg-slate-50 flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 ${
                    active
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
                  }`}
                >
                  <Icon className="text-lg" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 px-3 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto">{children}</div>
      </div>
    </div>
  );
};

export default AdminPageShell;
