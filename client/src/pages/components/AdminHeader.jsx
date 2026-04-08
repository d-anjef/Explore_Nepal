import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaBell, FaSignOutAlt, FaShieldAlt, FaChevronRight } from "react-icons/fa";
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
  { label: "Guide Apps", path: "/admin/guide-applications" },
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
  
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowLogoutMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPendingApplications = async () => {
    try {
      const res = await fetch("/api/guide-application/get-all-applications");
      const data = await res.json();
      if (data.success) {
        const deletedNotifications = JSON.parse(localStorage.getItem('adminDeletedApplications') || '[]');
        const pending = data.applications.filter(app => app.status === "pending" && !deletedNotifications.includes(app._id));
        setPendingApplications(pending);
        const seenNotifications = JSON.parse(localStorage.getItem('adminSeenApplications') || '[]');
        setUnseenCount(pending.filter(app => !seenNotifications.includes(app._id)).length);
      }
    } catch (error) {
      console.error("Admin notification fetch failed", error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      localStorage.setItem('adminSeenApplications', JSON.stringify(pendingApplications.map(app => app._id)));
      setUnseenCount(0);
    }
  };

  const handleDeleteNotification = (appId) => {
    const updated = pendingApplications.filter(app => app._id !== appId);
    setPendingApplications(updated);
    const deleted = JSON.parse(localStorage.getItem('adminDeletedApplications') || '[]');
    if (!deleted.includes(appId)) {
      deleted.push(appId);
      localStorage.setItem('adminDeletedApplications', JSON.stringify(deleted));
    }
    setUnseenCount(updated.filter(app => !JSON.parse(localStorage.getItem('adminSeenApplications') || '[]').includes(app._id)).length);
  };

  const handleLogout = async () => {
    try {
      dispatch(logOutStart());
      const res = await fetch("/api/auth/logout");
      const data = await res.json();
      if (!data.success) return dispatch(logOutFailure(data.message));
      dispatch(logOutSuccess());
      navigate("/login");
      toast.success("Admin logged out");
    } catch (error) {
      dispatch(logOutFailure(error.message));
    }
  };

  return (
    <header className="bg-slate-900 border-b border-indigo-500/30 sticky top-0 z-50 backdrop-blur-md bg-opacity-95 shadow-2xl">
      <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
        
        {/* Admin Branding */}
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <FaShieldAlt className="text-white text-lg" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-white uppercase tracking-[0.2em]">
              Control<span className="text-indigo-400">Center</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">System Administrator</p>
          </div>
        </div>

        {/* Dynamic Navigation for Admin Sections */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${
                location.pathname === item.path 
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-6 border-l border-slate-800 pl-6">
          
          {/* Admin Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={handleNotificationClick}
              className="text-slate-400 hover:text-indigo-400 transition-colors relative"
            >
              <FaBell size={20} />
              {unseenCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-[10px] font-black text-white w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                  {unseenCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden ring-1 ring-black ring-opacity-5">
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Pending Tasks</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {pendingApplications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs italic">All applications cleared</div>
                  ) : (
                    pendingApplications.map((app) => (
                      <div key={app._id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex justify-between items-start group">
                        <div className="flex-1">
                          <p className="text-[11px] font-black uppercase text-indigo-600 mb-1">New Guide Application</p>
                          <p className="text-xs text-slate-600 font-medium">{app.fullName || app.name}</p>
                          <Link 
                            to="/admin/guide-applications" 
                            onClick={() => setShowNotifications(false)}
                            className="text-[10px] text-indigo-500 hover:underline mt-2 flex items-center gap-1 font-bold"
                          >
                            Review Details <FaChevronRight size={8}/>
                          </Link>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteNotification(app._id); }}
                          className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
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

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <div 
              onClick={() => setShowLogoutMenu(!showLogoutMenu)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img
                src={currentUser?.avatar || defaultProfileImg}
                alt="Admin"
                className="w-9 h-9 rounded-xl border-2 border-slate-700 group-hover:border-indigo-500 transition-all object-cover"
              />
              <div className="hidden lg:block">
                <p className="text-xs font-black text-white uppercase tracking-tighter leading-none mb-1">
                  {currentUser?.username}
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Online</p>
                </div>
              </div>
            </div>

            {showLogoutMenu && (
              <div className="absolute right-0 mt-4 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 ring-1 ring-black ring-opacity-5">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  <FaSignOutAlt size={14}/> Logout Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;