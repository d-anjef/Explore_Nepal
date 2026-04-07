import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaBell } from "react-icons/fa";
import toast from "react-hot-toast";
import {
  logOutStart,
  logOutSuccess,
  logOutFailure,
} from "../../redux/user/userSlice";
import defaultProfileImg from "../../assets/images/profile.png";

const navItems = [
  { label: "Home", path: "/admin" },
  { label: "Bookings", path: "/admin/bookings" },
  { label: "Packages", path: "/admin/packages" },
  { label: "Users", path: "/admin/users" },
  { label: "Payments", path: "/admin/payments" },
  { label: "Ratings", path: "/admin/ratings" },
  { label: "History", path: "/admin/history" },
  { label: "Guide Applications", path: "/admin/guide-applications" },
];

const AdminHeader = () => {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [pendingApplications, setPendingApplications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const notificationRef = React.useRef(null);
  const profileRef = React.useRef(null);

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowLogoutMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchPendingApplications = async () => {
    try {
      const res = await fetch("/api/guide-application/get-all-applications", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      
      if (data.success) {
        // Get deleted notifications from localStorage
        const deletedNotifications = JSON.parse(localStorage.getItem('adminDeletedApplications') || '[]');
        
        // Filter out deleted notifications
        const pending = data.applications.filter(
          app => app.status === "pending" && !deletedNotifications.includes(app._id)
        );
        setPendingApplications(pending);
        
        // Get seen notifications from localStorage
        const seenNotifications = JSON.parse(localStorage.getItem('adminSeenApplications') || '[]');
        const unseen = pending.filter(app => !seenNotifications.includes(app._id));
        setUnseenCount(unseen.length);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const isAdminViewPage = location.pathname === "/admin/admin-view";

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Mark all as seen
      const applicationIds = pendingApplications.map(app => app._id);
      localStorage.setItem('adminSeenApplications', JSON.stringify(applicationIds));
      setUnseenCount(0);
    }
  };

  const handleDeleteNotification = (appId) => {
    const updated = pendingApplications.filter(app => app._id !== appId);
    setPendingApplications(updated);
    
    // Add to deleted notifications in localStorage
    const deletedNotifications = JSON.parse(localStorage.getItem('adminDeletedApplications') || '[]');
    if (!deletedNotifications.includes(appId)) {
      deletedNotifications.push(appId);
      localStorage.setItem('adminDeletedApplications', JSON.stringify(deletedNotifications));
    }
    
    // Update unseen count
    const seenNotifications = JSON.parse(localStorage.getItem('adminSeenApplications') || '[]');
    const unseen = updated.filter(app => !seenNotifications.includes(app._id));
    setUnseenCount(unseen.length);
  };

  const handleLogout = async () => {
    try {
      dispatch(logOutStart());
      const res = await fetch("/api/auth/logout");
      const data = await res.json();
      if (data?.success !== true) {
        dispatch(logOutFailure(data?.message));
        return;
      }
      dispatch(logOutSuccess());
      navigate("/login");
      toast.success(data?.message);
    } catch (error) {
      console.log(error);
      dispatch(logOutFailure(error.message));
    }
  };

  return (
    <header className="bg-sky-500 p-4 flex flex-row items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <h1
          className="h-min text-3xl md:text-4xl font-bold text-white"
        >
          Welcome Admin
        </h1>
        {!isAdminViewPage ? (
          <Link
            to="/admin/admin-view"
            className="text-xs sm:text-sm px-3 py-1 border border-white rounded-lg text-white hover:bg-slate-500 hover:scale-105 transition-all duration-150"
          >
            Admin View Site
          </Link>
        ) : (
          <Link
            to="/admin"
            className="text-xs sm:text-sm px-3 py-1 border border-white rounded-lg text-white hover:bg-slate-500 hover:scale-105 transition-all duration-150"
          >
            Back to Dashboard
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4 text-white">
        {currentUser && (
          <>
            {/* Admin Text (non-clickable) */}
            <span className="hidden sm:inline text-xs md:text-sm">
              Admin
            </span>

            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={handleNotificationClick}
                className="relative hover:scale-110 transition-all duration-150"
              >
                <FaBell className="text-2xl" />
                {unseenCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unseenCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">New Guide Applications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {pendingApplications.length === 0 ? (
                      <p className="p-4 text-gray-600 text-sm">No pending applications</p>
                    ) : (
                      pendingApplications.map((app) => (
                        <div
                          key={app._id}
                          className="p-4 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-start gap-2"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-600 mb-1">
                              New Guide Application
                            </p>
                            <p className="text-sm text-gray-700">
                              {app.name} applied to become a guide
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </p>
                            <Link
                              to="/admin/guide-applications"
                              className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                              onClick={() => setShowNotifications(false)}
                            >
                              View Application →
                            </Link>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(app._id);
                            }}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Picture with Dropdown */}
            <div className="relative" ref={profileRef}>
              <img
                src={currentUser.avatar || defaultProfileImg}
                alt="Admin"
                onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                className="w-9 h-9 rounded-full border border-black cursor-pointer hover:opacity-80 transition-opacity"
              />
              {showLogoutMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <button
                    onClick={() => {
                      setShowLogoutMenu(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-semibold"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
