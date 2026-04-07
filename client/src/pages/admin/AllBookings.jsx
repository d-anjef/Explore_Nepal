import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Chart from "../components/Chart";
import AdminPageShell from "./AdminPageShell";
import AdminTable from "../components/AdminTable";
import AdminButton from "../components/AdminButton";

const AllBookings = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [currentBookings, setCurrentBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getAllBookings = async () => {
    setCurrentBookings([]);
    try {
      setLoading(true);
      const res = await fetch(
        `/api/booking/get-currentBookings?searchTerm=${searchTerm}`
      );
      const data = await res.json();
      if (data?.success) {
        setCurrentBookings(data?.bookings);
        setLoading(false);
        setError(false);
      } else {
        setLoading(false);
        setError(data?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllBookings();
  }, [searchTerm]);

  const handleCancel = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Cancel Booking?</p>
        <p className="text-sm text-gray-600">Are you sure you want to cancel this booking? This action cannot be undone.</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              performCancel(id);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm"
          >
            Cancel Booking
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold text-sm"
          >
            Keep Booking
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
    });
  };

  const performCancel = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/booking/cancel-booking/${id}/${currentUser._id}`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (data?.success) {
        setLoading(false);
        toast.success(data?.message);
        getAllBookings();
      } else {
        setLoading(false);
        toast.error(data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to cancel booking");
      setLoading(false);
    }
  };

  return (
    <AdminPageShell>
      <div className="w-full max-w-6xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Current Bookings</h1>
            <p className="text-sm text-slate-500">
              View and manage all active bookings.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto">
            <input
              className="border border-slate-300 rounded-lg p-2 text-sm w-full sm:w-64"
              type="text"
              placeholder="Search Username or Email"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
          </div>
        </div>

        {currentBookings.length > 0 && (
          <div className="border border-slate-200 rounded-xl bg-white p-3">
            <Chart data={currentBookings} />
          </div>
        )}

        {loading && (
          <p className="text-center text-sm text-slate-600">Loading...</p>
        )}
        {error && (
          <p className="text-center text-sm text-red-600 font-medium">{error}</p>
        )}

        {!loading && currentBookings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-600 text-lg">No bookings found</p>
            <p className="text-slate-500 text-sm mt-2">Bookings will appear here once users make reservations</p>
          </div>
        )}

        {currentBookings.length > 0 && (
        <AdminTable>
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Package
              </th>
              <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Customer
              </th>
              <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Email
              </th>
              <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Date
              </th>
              <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              currentBookings &&
              currentBookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-b last:border-b-0 hover:bg-slate-50/80"
                >
                  <td className="px-3 py-2 align-middle">
                    <div className="flex items-center gap-2">
                      <Link to={`/package/${booking?.packageDetails?._id}`}>
                        <img
                          className="w-10 h-10 rounded object-cover"
                          src={booking?.packageDetails?.packageImages[0]}
                          alt="Package"
                        />
                      </Link>
                      <Link to={`/package/${booking?.packageDetails?._id}`}>
                        <p className="font-medium text-sm text-slate-800 hover:underline">
                          {booking?.packageDetails?.packageName}
                        </p>
                      </Link>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-middle text-sm text-slate-700">
                    {booking?.buyer?.username}
                  </td>
                  <td className="px-3 py-2 align-middle text-sm text-slate-700">
                    {booking?.buyer?.email}
                  </td>
                  <td className="px-3 py-2 align-middle text-sm text-slate-700">
                    {booking?.date}
                  </td>
                  <td className="px-3 py-2 align-middle text-right">
                    <AdminButton
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancel(booking._id)}
                    >
                      Cancel
                    </AdminButton>
                  </td>
                </tr>
              ))}
          </tbody>
        </AdminTable>
        )}
      </div>
    </AdminPageShell>
  );
};

export default AllBookings;
