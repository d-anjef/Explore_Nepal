import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaSearch, FaEye, FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import AdminPageShell from "./AdminPageShell";
import AdminTable from "../components/AdminTable";
import AdminButton from "../components/AdminButton";

const GuideApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [guideBookings, setGuideBookings] = useState({});

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/guide-application/get-all-applications?searchTerm=${searchTerm}&status=${statusFilter}`,
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

      if (data.success) {
        setApplications(data.applications);
        // Fetch booking status for approved guides
        await fetchGuideBookings(data.applications);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchGuideBookings = async (apps) => {
    try {
      // Get all guide messages
      const res = await fetch('/api/guide-message/get-all-messages', {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        // Create a map of guide emails to their ACTIVE bookings count
        const bookingsMap = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
        
        data.messages.forEach((msg) => {
          if (msg.status === 'approved' && msg.tourDate && msg.tourDays) {
            const tourStartDate = new Date(msg.tourDate);
            tourStartDate.setHours(0, 0, 0, 0);
            
            // Calculate tour end date (start date + duration)
            const tourEndDate = new Date(tourStartDate);
            tourEndDate.setDate(tourEndDate.getDate() + parseInt(msg.tourDays));
            
            // Only count as booked if tour is currently active (today is between start and end date)
            if (today >= tourStartDate && today < tourEndDate) {
              bookingsMap[msg.guideEmail] = (bookingsMap[msg.guideEmail] || 0) + 1;
            }
          }
        });
        setGuideBookings(bookingsMap);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [searchTerm, statusFilter]);

  const handleStatusUpdate = async (id, status) => {
    const statusMessages = {
      approved: {
        title: "Approve Guide Application?",
        message: "This will grant guide access to the applicant.",
        confirmText: "Approve",
        confirmColor: "bg-green-600 hover:bg-green-700"
      },
      rejected: {
        title: "Reject Guide Application?",
        message: "The applicant will be notified of the rejection.",
        confirmText: "Reject",
        confirmColor: "bg-red-600 hover:bg-red-700"
      },
      pending: {
        title: "Set as Pending?",
        message: "This will change the application status back to pending.",
        confirmText: "Set Pending",
        confirmColor: "bg-yellow-600 hover:bg-yellow-700"
      }
    };

    const config = statusMessages[status];

    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">{config.title}</p>
        <p className="text-sm text-gray-600">{config.message}</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              performStatusUpdate(id, status);
            }}
            className={`px-4 py-2 text-white rounded-lg font-semibold text-sm ${config.confirmColor}`}
          >
            {config.confirmText}
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

  const performStatusUpdate = async (id, status) => {
    try {
      const res = await fetch(
        `/api/guide-application/update-status/${id}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        fetchApplications();
        setShowModal(false);
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    // Use toast.promise for better UX
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Delete Application?</p>
        <p className="text-sm text-gray-600">This action cannot be undone.</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              performDelete(id);
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

  const performDelete = async (id) => {
    try {
      const res = await fetch(
        `/api/guide-application/delete-application/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        fetchApplications();
        setShowModal(false);
      } else {
        toast.error(data.message || "Failed to delete application");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete application");
    }
  };

  const viewDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return styles[status] || styles.pending;
  };

  return (
    <AdminPageShell>
      <div className="w-full p-4 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Guide Job Applications</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No applications found</p>
        </div>
      ) : (
        <AdminTable>
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-left">
                Name
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-left">
                Email
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-left">
                Phone
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-left">
                Experience
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-left">
                Status
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-left">
                Bookings
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-left">
                Applied On
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const bookingCount = guideBookings[app.email] || 0;
              return (
              <tr
                key={app._id}
                className="border-b last:border-b-0 hover:bg-slate-50/80"
              >
                <td className="px-4 py-3 align-middle text-sm text-slate-800">
                  {app.fullName}
                </td>
                <td className="px-4 py-3 align-middle text-sm text-slate-700">
                  {app.email}
                </td>
                <td className="px-4 py-3 align-middle text-sm text-slate-700">
                  {app.phone}
                </td>
                <td className="px-4 py-3 align-middle text-sm text-slate-700">
                  {app.experience} years
                </td>
                <td className="px-4 py-3 align-middle">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                      app.status
                    )}`}
                  >
                    {app.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 align-middle">
                  {app.status === 'approved' ? (
                    bookingCount > 0 ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {bookingCount} Booked
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        Available
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 align-middle text-sm text-slate-700">
                  {new Date(app.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex justify-center gap-2">
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      onClick={() => viewDetails(app)}
                      title="View Details"
                      className="text-blue-600"
                    >
                      <FaEye />
                    </AdminButton>
                    <AdminButton
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(app._id)}
                      title="Delete"
                      className="flex items-center justify-center"
                    >
                      <FaTrash />
                    </AdminButton>
                  </div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </AdminTable>
      )}

      {/* Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">Application Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Personal Info */}
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-lg mb-2">
                    Personal Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-semibold">
                        {selectedApplication.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">
                        {selectedApplication.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold">
                        {selectedApplication.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-semibold">
                        {selectedApplication.dateOfBirth}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-semibold">
                        {selectedApplication.address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-lg mb-2">
                    Professional Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-semibold">
                        {selectedApplication.experience} years
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Languages</p>
                      <p className="font-semibold">
                        {selectedApplication.languages}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-lg mb-2">Cover Letter</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedApplication.coverLetter}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <h4 className="font-semibold text-lg mb-2">Status</h4>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(
                      selectedApplication.status
                    )}`}
                  >
                    {selectedApplication.status.toUpperCase()}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 flex-wrap">
                  {selectedApplication.status !== "approved" && (
                    <AdminButton
                      variant="primary"
                      size="md"
                      onClick={() =>
                        handleStatusUpdate(selectedApplication._id, "approved")
                      }
                      className="flex items-center gap-2"
                    >
                      <FaCheck />
                      <span>Approve</span>
                    </AdminButton>
                  )}
                  {selectedApplication.status !== "rejected" && (
                    <AdminButton
                      variant="danger"
                      size="md"
                      onClick={() =>
                        handleStatusUpdate(selectedApplication._id, "rejected")
                      }
                      className="flex items-center gap-2"
                    >
                      <FaTimes />
                      <span>Reject</span>
                    </AdminButton>
                  )}
                  {selectedApplication.status !== "pending" && (
                    <AdminButton
                      variant="secondary"
                      size="md"
                      onClick={() =>
                        handleStatusUpdate(selectedApplication._id, "pending")
                      }
                      className="flex items-center gap-2"
                    >
                      <span>Set as Pending</span>
                    </AdminButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminPageShell>
  );
};

export default GuideApplications;
