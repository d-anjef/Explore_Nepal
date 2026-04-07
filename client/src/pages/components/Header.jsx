import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FaBell } from "react-icons/fa";
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
  const [approvedMessagesCount, setApprovedMessagesCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [approvedMessages, setApprovedMessages] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationRef = React.useRef(null);
  const profileRef = React.useRef(null);

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/";
  const isHomePage = location.pathname === "/home";

  useEffect(() => {
    const checkGuideStatus = async () => {
      if (!currentUser?.email) {
        setHasGuideApplication(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/guide-application/check-guide-status/${currentUser.email}`
        );
        const data = await res.json();

        if (data.success && data.hasApplication) {
          setHasGuideApplication(true);
          setApplicationStatus(data.status);
        } else {
          setHasGuideApplication(false);
          setApplicationStatus(null);
        }
      } catch (error) {
        console.log(error);
        setHasGuideApplication(false);
      }
    };

    checkGuideStatus();
    fetchUserNotifications();
  }, [currentUser]);

  // Refresh notifications periodically (every 30 seconds)
  useEffect(() => {
    if (!currentUser?.email) return;

    const interval = setInterval(() => {
      fetchUserNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentUser]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUserNotifications = async () => {
    if (!currentUser?.email) return;

    try {
      // Get seen and deleted notifications from localStorage
      const seenNotifications = JSON.parse(localStorage.getItem(`seenNotifications_${currentUser.email}`) || '[]');
      const deletedNotifications = JSON.parse(localStorage.getItem(`deletedNotifications_${currentUser.email}`) || '[]');

      // Fetch guide request messages
      const res = await fetch(
        `/api/guide-message/get-user-messages/${currentUser.email}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();

      let notifications = [];
      if (data.success) {
        // Show approved requests
        const approved = data.messages.filter((msg) => msg.status === "approved" && !deletedNotifications.includes(msg._id));
        const approvedNotifications = approved.map((msg) => ({
          id: msg._id,
          type: "guide_request_approved",
          title: "Guide Accepted Your Request!",
          message: `${msg.guideName} has accepted your tour request for ${msg.tourDays} days starting ${new Date(msg.tourDate).toLocaleDateString()}.`,
          date: msg.updatedAt,
          seen: seenNotifications.includes(msg._id),
        }));

        // Show rejected requests
        const rejected = data.messages.filter((msg) => msg.status === "rejected" && !deletedNotifications.includes(msg._id));
        const rejectedNotifications = rejected.map((msg) => ({
          id: msg._id,
          type: "guide_request_rejected",
          title: "Guide Declined Your Request",
          message: `${msg.guideName} has declined your tour request for ${msg.tourDays} days starting ${new Date(msg.tourDate).toLocaleDateString()}.`,
          date: msg.updatedAt,
          seen: seenNotifications.includes(msg._id),
        }));

        notifications = [...approvedNotifications, ...rejectedNotifications];
      }

      // Fetch guide application status
      const appRes = await fetch(
        `/api/guide-application/check-guide-status/${currentUser.email}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const appData = await appRes.json();

      if (appData.success && appData.hasApplication) {
        const appId = `app-${appData.application._id}`;
        
        // Only show if not deleted
        if (!deletedNotifications.includes(appId)) {
          if (appData.status === "approved") {
            notifications.push({
              id: appId,
              type: "guide_application_approved",
              title: "Guide Application Approved!",
              message: "Congratulations! Your guide application has been approved by the admin.",
              date: appData.application.updatedAt,
              seen: seenNotifications.includes(appId),
            });
          } else if (appData.status === "rejected") {
            notifications.push({
              id: appId,
              type: "guide_application_rejected",
              title: "Guide Application Rejected",
              message: "Unfortunately, your guide application has been rejected by the admin.",
              date: appData.application.updatedAt,
              seen: seenNotifications.includes(appId),
            });
          }
        }
      } else if (appData.success && !appData.hasApplication) {
        // Check if user previously had an application (it was deleted)
        const deletedAppId = `app-deleted-${currentUser.email}`;
        
        // Only show deletion notification if user had checked their status before and hasn't deleted this notification
        if (!deletedNotifications.includes(deletedAppId) && localStorage.getItem(`hadGuideApp_${currentUser.email}`) === 'true') {
          notifications.push({
            id: deletedAppId,
            type: "guide_application_deleted",
            title: "Guide Application Removed",
            message: "You have been removed as a guide. Your application has been deleted by the admin.",
            date: new Date().toISOString(),
            seen: false,
          });
        }
      }
      
      // Track if user has/had a guide application
      if (appData.success && appData.hasApplication) {
        localStorage.setItem(`hadGuideApp_${currentUser.email}`, 'true');
      }

      // Fetch guide tour requests if user is an approved guide
      if (applicationStatus === 'approved') {
        try {
          const guideRes = await fetch(`/api/guide-message/get-messages/${currentUser.email}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          const guideData = await guideRes.json();

          if (guideData.success) {
            const pendingRequests = guideData.messages
              .filter((msg) => (msg.status === "unread" || msg.status === "read") && !deletedNotifications.includes(msg._id))
              .map((msg) => ({
                id: msg._id,
                type: "guide_tour_request",
                title: msg.status === "unread" ? "New Tour Request" : "Tour Request",
                message: `${msg.userName} wants to book you for a ${msg.tourDays}-day tour starting ${new Date(msg.tourDate).toLocaleDateString()}`,
                date: msg.createdAt,
                seen: seenNotifications.includes(msg._id),
                link: "/guide",
              }));

            // Add guide requests to notifications
            notifications = [...notifications, ...pendingRequests];
          }
        } catch (error) {
          console.log("Error fetching guide requests:", error);
        }
      }

      setApprovedMessages(notifications);
      setApprovedMessagesCount(notifications.length);
      
      // Count unseen notifications
      const unseen = notifications.filter(n => !n.seen).length;
      setUnseenCount(unseen);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGuideClick = (e) => {
    if (!hasGuideApplication) {
      e.preventDefault();
      toast.error("First submit your guide application");
      navigate("/guide-application");
    } else if (applicationStatus === "pending") {
      e.preventDefault();
      toast.error("Your application is pending");
    } else if (applicationStatus === "rejected") {
      e.preventDefault();
      toast.error("Your application has been rejected");
    }
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

  const handleDeleteAccount = async () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Delete Account?</p>
        <p className="text-sm text-gray-600">This action cannot be undone. Your account will be permanently deleted!</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              performDeleteAccount();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
    });
  };

  const performDeleteAccount = async () => {
    try {
      dispatch(deleteUserAccountStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data?.success === false) {
        dispatch(deleteUserAccountFailure(data?.message));
        toast.error("Something went wrong!");
        return;
      }
      dispatch(deleteUserAccountSuccess());
      toast.success(data?.message);
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  if (currentUser?.user_role === 1 && isAdminRoute) {
    return <AdminHeader />;
  }

  return (
    <>
      <div className={`bg-sky-500 p-4 flex items-center sticky top-0 z-50 ${isAuthPage ? 'justify-center' : 'justify-between'}`}>
        <h1 className="h-min text-4xl font-bold text-white">
          {isHomePage && currentUser ? (
            applicationStatus === 'approved' 
              ? `Welcome, Guide ${currentUser.username}!` 
              : `Welcome, ${currentUser.username}!`
          ) : 'Explore Nepal'}
        </h1>
        {!isAuthPage && (
          <ul className="flex flex-wrap items-center justify-end gap-2 text-white font-semibold list-none">
          {!isAuthPage && (
            <>
              <li className="hover:underline hover:scale-105 transition-all duration-150">
                <Link to={`/home`}>Home</Link>
              </li>
              <li className="hover:underline hover:scale-105 transition-all duration-150">
                <Link to={`/search`}>Packages</Link>
              </li>
              <li className="hover:underline hover:scale-105 transition-all duration-150">
                <Link to={`/guide`} onClick={handleGuideClick}>
                  Guide
                </Link>
              </li>
              <li className="hover:underline hover:scale-105 transition-all duration-150">
                <Link to={`/about`}>About</Link>
              </li>
            </>
          )}
          {!isAuthPage && currentUser && (
            <li className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) {
                    // Refresh notifications when opening dropdown
                    fetchUserNotifications();
                    // Mark all notifications as seen when opening dropdown
                    const notificationIds = approvedMessages.map(n => n.id);
                    localStorage.setItem(`seenNotifications_${currentUser.email}`, JSON.stringify(notificationIds));
                    setUnseenCount(0);
                  }
                }}
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
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    {applicationStatus === 'approved' && approvedMessages.some(n => n.type === 'guide_tour_request') && (
                      <Link
                        to="/guide"
                        className="text-xs text-blue-600 hover:underline font-semibold"
                        onClick={() => setShowNotifications(false)}
                      >
                        Guide Dashboard →
                      </Link>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {approvedMessages.length === 0 ? (
                      <p className="p-4 text-gray-600 text-sm">No notifications</p>
                    ) : (
                      approvedMessages.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-start gap-2"
                        >
                          <div className="flex-1">
                            <p className={`text-sm font-semibold mb-1 ${
                              notification.type === 'guide_application_approved' ? 'text-green-600' :
                              notification.type === 'guide_application_rejected' ? 'text-red-600' :
                              notification.type === 'guide_application_deleted' ? 'text-red-700' :
                              notification.type === 'guide_tour_request' ? 'text-blue-600' :
                              notification.type === 'guide_request_approved' ? 'text-green-600' :
                              notification.type === 'guide_request_rejected' ? 'text-red-600' :
                              'text-green-600'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-700">
                              {notification.message}
                            </p>
                            {notification.link && (
                              <Link
                                to={notification.link}
                                onClick={() => setShowNotifications(false)}
                                className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                              >
                                View in Dashboard →
                              </Link>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.date).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const updatedMessages = approvedMessages.filter(n => n.id !== notification.id);
                              setApprovedMessages(updatedMessages);
                              setApprovedMessagesCount(updatedMessages.length);
                              const unseenCount = updatedMessages.filter(n => !n.seen).length;
                              setUnseenCount(unseenCount);
                              
                              // Add to deleted notifications in localStorage
                              const deletedNotifications = JSON.parse(localStorage.getItem(`deletedNotifications_${currentUser.email}`) || '[]');
                              if (!deletedNotifications.includes(notification.id)) {
                                deletedNotifications.push(notification.id);
                                localStorage.setItem(`deletedNotifications_${currentUser.email}`, JSON.stringify(deletedNotifications));
                              }
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
            </li>
          )}
          {!isAuthPage && (
            <li className="relative flex items-center justify-center">
              {currentUser ? (
                <div className="relative" ref={profileRef}>
                  <img
                    src={currentUser.avatar || defaultProfileImg}
                    alt={currentUser.username}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="border w-10 h-10 border-black rounded-[50%] cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <Link
                        to={currentUser.user_role === 1 ? "/admin" : "/profile/user"}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg font-semibold"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        👤 Profile
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 font-semibold"
                      >
                        🚪 Logout
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleDeleteAccount();
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-lg font-semibold"
                      >
                        🗑️ Delete Account
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to={`/login`}>Login</Link>
              )}
            </li>
          )}
        </ul>
        )}
      </div>
    </>
  );
};

export default Header;