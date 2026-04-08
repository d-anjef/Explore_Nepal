import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FaBell, FaUser, FaSignOutAlt, FaTrashAlt, FaHome, FaBoxOpen, FaUserTie, FaInfoCircle } from "react-icons/fa";
import {
  logOutStart,
  logOutSuccess,
  logOutFailure,
  deleteUserAccountStart,
  deleteUserAccountSuccess,
  deleteUserAccountFailure,
} from "../../redux/user/userSlice";
import defaultProfileImg from "../../assets/images/profile.png";
import AdminHeader from "./AdminHeader";

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [hasGuideApplication, setHasGuideApplication] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [approvedMessages, setApprovedMessages] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAuthPage = ["/login", "/signup", "/"].includes(location.pathname);
  const isHomePage = location.pathname === "/home";

  // Check Guide Application Status
  useEffect(() => {
    const checkGuideStatus = async () => {
      if (!currentUser?.email) return;
      try {
        const res = await fetch(`/api/guide-application/check-guide-status/${currentUser.email}`);
        const data = await res.json();
        if (data.success && data.hasApplication) {
          setHasGuideApplication(true);
          setApplicationStatus(data.status);
        }
      } catch (error) {
        console.error("Guide status check failed", error);
      }
    };
    checkGuideStatus();
    fetchUserNotifications();
  }, [currentUser]);

  // Notifications logic
  useEffect(() => {
    if (!currentUser?.email) return;
    const interval = setInterval(fetchUserNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser, applicationStatus]);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserNotifications = async () => {
    if (!currentUser?.email) return;
    try {
      const seenNotifications = JSON.parse(localStorage.getItem(`seenNotifications_${currentUser.email}`) || '[]');
      const deletedNotifications = JSON.parse(localStorage.getItem(`deletedNotifications_${currentUser.email}`) || '[]');

      const res = await fetch(`/api/guide-message/get-user-messages/${currentUser.email}`);
      const data = await res.json();

      let notifications = [];
      if (data.success) {
        const relevant = data.messages.filter(msg => 
          (msg.status === "approved" || msg.status === "rejected") && !deletedNotifications.includes(msg._id)
        );
        
        notifications = relevant.map(msg => ({
          id: msg._id,
          type: msg.status === "approved" ? "guide_request_approved" : "guide_request_rejected",
          title: msg.status === "approved" ? "Request Accepted!" : "Request Declined",
          message: `${msg.guideName} response for ${msg.tourDays} days tour.`,
          date: msg.updatedAt,
          seen: seenNotifications.includes(msg._id),
        }));
      }

      setApprovedMessages(notifications);
      setUnseenCount(notifications.filter(n => !n.seen).length);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      dispatch(logOutStart());
      const res = await fetch("/api/auth/logout");
      const data = await res.json();
      if (!data.success) return dispatch(logOutFailure(data.message));
      dispatch(logOutSuccess());
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      dispatch(logOutFailure(error.message));
    }
  };

  const handleDeleteAccount = async () => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-bold text-red-600">Delete Account Permanently?</p>
        <div className="flex gap-2">
          <button onClick={() => { toast.dismiss(t.id); performDeleteAccount(); }} className="bg-red-600 text-white px-3 py-1 rounded text-xs">Delete</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-gray-200 px-3 py-1 rounded text-xs">Cancel</button>
        </div>
      </div>
    ));
  };

  const performDeleteAccount = async () => {
    try {
      dispatch(deleteUserAccountStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) return dispatch(deleteUserAccountFailure(data.message));
      dispatch(deleteUserAccountSuccess());
      toast.success("Account deleted");
    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  if (currentUser?.user_role === 1 && isAdminRoute) return <AdminHeader />;

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className={`max-w-7xl mx-auto px-4 py-3 flex items-center ${isAuthPage ? 'justify-center' : 'justify-between'}`}>
        
        {/* Logo Section */}
        <Link to="/home" className="flex flex-col">
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
            Explore<span className="text-sky-400">Nepal</span>
          </h1>
          {isHomePage && currentUser && (
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-[-4px]">
               {applicationStatus === 'approved' ? `Guide Dashboard: ${currentUser.username}` : `Traveler: ${currentUser.username}`}
             </p>
          )}
        </Link>

        {!isAuthPage && (
          <nav className="flex items-center gap-6">
            {/* Navigation Links */}
            <ul className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-300">
              <li><Link to="/home" className="hover:text-sky-400 flex items-center gap-2 transition-colors"><FaHome size={14}/> Home</Link></li>
              <li><Link to="/search" className="hover:text-sky-400 flex items-center gap-2 transition-colors"><FaBoxOpen size={14}/> Packages</Link></li>
              <li>
                <Link to="/guide" onClick={(e) => {
                  if (!hasGuideApplication) { e.preventDefault(); toast.error("Submit application first"); navigate("/guide-application"); }
                  else if (applicationStatus === "pending") { e.preventDefault(); toast.error("Application pending"); }
                }} className="hover:text-sky-400 flex items-center gap-2 transition-colors">
                  <FaUserTie size={14}/> Guide
                </Link>
              </li>
              <li><Link to="/about" className="hover:text-sky-400 flex items-center gap-2 transition-colors"><FaInfoCircle size={14}/> About</Link></li>
            </ul>

            <div className="flex items-center gap-4 border-l border-slate-700 pl-6">
              {/* Notification Bell */}
              {currentUser && (
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (!showNotifications) {
                        setUnseenCount(0);
                        localStorage.setItem(`seenNotifications_${currentUser.email}`, JSON.stringify(approvedMessages.map(n => n.id)));
                      }
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <FaBell size={20} />
                    {unseenCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-sky-500 text-[10px] font-bold text-white w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                        {unseenCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-4 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden ring-1 ring-black ring-opacity-5">
                      <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {approvedMessages.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-xs">No new updates</div>
                        ) : (
                          approvedMessages.map((notif) => (
                            <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors relative group">
                              <p className={`text-[11px] font-black uppercase mb-1 ${notif.type.includes('approved') ? 'text-emerald-500' : 'text-red-500'}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                              <p className="text-[9px] text-slate-400 mt-2">{new Date(notif.date).toDateString()}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Profile Menu */}
              {currentUser ? (
                <div className="relative" ref={profileRef}>
                  <img
                    src={currentUser.avatar || defaultProfileImg}
                    alt="User"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-9 h-9 rounded-xl border-2 border-slate-700 hover:border-sky-400 transition-all cursor-pointer object-cover"
                  />
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-3 border-b border-slate-50 mb-1">
                        <p className="text-xs font-black text-slate-900 truncate">{currentUser.username}</p>
                        <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                      </div>
                      <Link to={currentUser.user_role === 1 ? "/admin" : "/profile/user"} onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-sky-600 transition-colors">
                        <FaUser size={12}/> My Profile
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors">
                        <FaSignOutAlt size={12}/> Logout
                      </button>
                      <button onClick={handleDeleteAccount} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <FaTrashAlt size={12}/> Delete Account
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-sky-500/20">
                  Login
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;