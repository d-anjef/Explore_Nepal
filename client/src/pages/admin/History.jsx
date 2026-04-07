import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AdminPageShell from "./AdminPageShell";
import AdminTable from "../components/AdminTable";
import AdminButton from "../components/AdminButton";

const History = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const getAllBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/booking/get-allBookings?searchTerm=${search}`
      );
      const data = await res.json();
      if (data?.success) {
        setAllBookings(data?.bookings);
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
  }, [search]);

  const handleHistoryDelete = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Delete Booking History?</p>
        <p className="text-sm text-gray-600">This will permanently remove this booking record from history.</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              performHistoryDelete(id);
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

  const performHistoryDelete = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/booking/delete-booking-history/${id}/${currentUser._id}`,
        {
          method: "DELETE",
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
      toast.error("Failed to delete booking history");
      setLoading(false);
    }
  };

  return (
    <AdminPageShell>
      <div className="w-full max-w-6xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Booking History</h1>
            <p className="text-sm text-slate-500">
              See completed or cancelled bookings and clean up old records.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto">
            <input
              className="border border-slate-300 rounded-lg p-2 text-sm w-full sm:w-64"
              type="text"
              placeholder="Search Username or Email"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </div>
        </div>

        {loading && (
          <p className="text-center text-sm text-slate-600">Loading...</p>
        )}
        {error && (
          <p className="text-center text-sm text-red-600 font-medium">{error}</p>
        )}

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
              allBookings &&
              allBookings.map((booking) => (
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
                    {(new Date(booking?.date).getTime() < new Date().getTime() ||
                      booking?.status === "Cancelled") && (
                      <AdminButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleHistoryDelete(booking._id)}
                      >
                        Delete
                      </AdminButton>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </AdminTable>
      </div>
    </AdminPageShell>
  );
};

export default History;
