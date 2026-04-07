import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaCalendarCheck,
  FaBoxOpen,
  FaUsers,
  FaMoneyCheckAlt,
  FaStar,
  FaHistory,
  FaUserTie,
} from "react-icons/fa";
import AdminPageShell from "./AdminPageShell";

const sections = [
  {
    title: "Admin Profile",
    description: "View and manage admin profile information.",
    to: "/admin/dashboard",
    icon: FaUserTie,
    accent: "bg-purple-100 text-purple-600",
  },
  {
    title: "Manage Bookings",
    description: "View and manage all current bookings.",
    to: "/admin/bookings",
    icon: FaCalendarCheck,
    accent: "bg-blue-100 text-blue-600",
  },
  {
    title: "Manage Packages",
    description: "Create, update or delete travel packages.",
    to: "/admin/packages",
    icon: FaBoxOpen,
    accent: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "View Users",
    description: "See all registered users and manage their accounts.",
    to: "/admin/users",
    icon: FaUsers,
    accent: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "View Payment Info",
    description: "Review all completed payments.",
    to: "/admin/payments",
    icon: FaMoneyCheckAlt,
    accent: "bg-amber-100 text-amber-600",
  },
  {
    title: "View Ratings & Reviews",
    description: "Monitor package ratings and customer feedback.",
    to: "/admin/ratings",
    icon: FaStar,
    accent: "bg-fuchsia-100 text-fuchsia-600",
  },
  {
    title: "View Booking History",
    description: "See historic bookings and clean up old records.",
    to: "/admin/history",
    icon: FaHistory,
    accent: "bg-slate-100 text-slate-600",
  },
  {
    title: "Guide Applications",
    description: "Accept or reject new guide applications.",
    to: "/admin/guide-applications",
    icon: FaUserTie,
    accent: "bg-teal-100 text-teal-600",
  },
];

const AdminHome = () => {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <AdminPageShell>
      <div className="space-y-6">
        {/* Main navigation cards */}
        <section className="space-y-3">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-gray-800">
              Management Overview
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.to}
                  to={section.to}
                  className="group bg-white shadow rounded-lg p-4 border border-gray-200 hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-lg ${section.accent}`}
                    >
                      <Icon />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                      {section.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 flex-1">
                    {section.description}
                  </p>

                  <span className="text-[12px] sm:text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                    Open section
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </AdminPageShell>
  );
};

export default AdminHome;
