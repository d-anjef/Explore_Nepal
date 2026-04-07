import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FaCalendarCheck, FaEnvelope, FaTrash, FaCheckCircle, FaUsers } from "react-icons/fa";

const GuideDashboard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchMessages = async () => {
    if (!currentUser?.email) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/guide-message/get-messages/${currentUser.email}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [currentUser]);

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setShowModal(true);

    if (message.status === "unread") {
      try {
        await fetch(`/api/guide-message/mark-read/${message._id}`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        fetchMessages();
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleAcceptMessage = async (id) => {
    try {
      const res = await fetch(`/api/guide-message/update-status/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: "approved" }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        // Update the selected message status
        setSelectedMessage({ ...selectedMessage, status: "approved" });
        fetchMessages();
      } else {
        toast.error(data.message || "Failed to approve message");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to approve message");
    }
  };

  const handleRejectMessage = async (id) => {
    try {
      const res = await fetch(`/api/guide-message/update-status/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: "rejected" }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        // Update the selected message status
        setSelectedMessage({ ...selectedMessage, status: "rejected" });
        fetchMessages();
      } else {
        toast.error(data.message || "Failed to reject message");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to reject message");
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      const res = await fetch(`/api/guide-message/delete-message/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        fetchMessages();
        setShowModal(false);
      } else {
        toast.error(data.message || "Failed to delete message");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete message");
    }
  };

  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const pendingMessages = messages.filter((m) => m.status === "unread" || m.status === "read");
  const approvedMessages = messages.filter((m) => m.status === "approved");

  return (
    <div className="w-full bg-slate-50 px-3 sm:px-6 py-6 min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero / welcome */}
        <section className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl p-6 lg:p-8 shadow-lg">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-emerald-100 font-semibold">
              Guide dashboard
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-snug">
              Welcome{currentUser ? `, ${currentUser.username}` : ""}.
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90">
              Manage your messages from travelers and respond to tour inquiries.
            </p>
          </div>
        </section>

        {/* Messages Section */}
        <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-emerald-600 text-xl" />
              <h2 className="text-xl font-semibold text-slate-800">
                User Requests
              </h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-600">Loading messages...</p>
          ) : pendingMessages.length === 0 ? (
            <p className="text-sm text-slate-600">No pending requests</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {pendingMessages.map((msg) => (
                <div
                  key={msg._id}
                  className={`p-4 border rounded-lg transition-all ${
                    msg.status === "unread"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => handleViewMessage(msg)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800">
                          {msg.userName}
                        </h3>
                        {msg.status === "unread" && (
                          <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{msg.userEmail}</p>
                      <p className="text-sm text-slate-700 mt-2 line-clamp-2">
                        {msg.message}
                      </p>
                      <span className="text-xs text-slate-500 mt-2 block">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMessage(msg._id);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                      title="Delete message"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Guiding History Section */}
        <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-blue-600 text-xl" />
              <h2 className="text-xl font-semibold text-slate-800">
                Guiding History
              </h2>
              {approvedMessages.length > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {approvedMessages.length}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-600">Loading history...</p>
          ) : approvedMessages.length === 0 ? (
            <p className="text-sm text-slate-600">No accepted tours yet</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {approvedMessages.map((msg) => (
                <div
                  key={msg._id}
                  className="p-4 border border-blue-200 bg-blue-50 rounded-lg transition-all"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => handleViewMessage(msg)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800">
                          {msg.userName}
                        </h3>
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          ACCEPTED
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{msg.userEmail}</p>
                      {msg.tourDays && msg.tourDate && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-slate-700">
                            <span className="font-semibold">Tour Date:</span>{" "}
                            {new Date(msg.tourDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-slate-700">
                            <span className="font-semibold">Duration:</span>{" "}
                            {msg.tourDays} {msg.tourDays === 1 ? 'day' : 'days'}
                          </p>
                        </div>
                      )}
                      <span className="text-xs text-slate-500 mt-2 block">
                        Accepted on: {new Date(msg.updatedAt || msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMessage(msg._id);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                      title="Delete record"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Message Modal */}
        {showModal && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">Message Details</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-3xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  {/* User Info */}
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-lg text-gray-800 mb-3">
                      From: {selectedMessage.userName}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-emerald-600" />
                        <span className="text-gray-600">Email:</span>
                        <a
                          href={`mailto:${selectedMessage.userEmail}`}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          {selectedMessage.userEmail}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaUsers className="text-emerald-600" />
                        <span className="text-gray-600">Phone:</span>
                        <a
                          href={`tel:${selectedMessage.userPhone}`}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          {selectedMessage.userPhone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-emerald-600" />
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`font-semibold ${
                            selectedMessage.status === "unread"
                              ? "text-emerald-600"
                              : "text-gray-600"
                          }`}
                        >
                          {selectedMessage.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendarCheck className="text-emerald-600" />
                        <span className="text-gray-600">Received:</span>
                        <span className="font-semibold">
                          {new Date(selectedMessage.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tour Details */}
                  {selectedMessage.tourDays && selectedMessage.tourDate && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-lg mb-2 text-gray-800">Tour Details:</h4>
                      <div className="bg-emerald-50 p-4 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <FaCalendarCheck className="text-emerald-600" />
                          <span className="text-gray-600">Tour Start Date:</span>
                          <span className="font-semibold text-gray-800">
                            {new Date(selectedMessage.tourDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCalendarCheck className="text-emerald-600" />
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-semibold text-gray-800">
                            {selectedMessage.tourDays} {selectedMessage.tourDays === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-lg mb-2 text-gray-800">Message:</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    {selectedMessage.status !== "approved" && (
                      <button
                        onClick={() => handleAcceptMessage(selectedMessage._id)}
                        className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all"
                      >
                        Accept
                      </button>
                    )}
                    {selectedMessage.status !== "rejected" && selectedMessage.status !== "approved" && (
                      <button
                        onClick={() => handleRejectMessage(selectedMessage._id)}
                        className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-all"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideDashboard;
