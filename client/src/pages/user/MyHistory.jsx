import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AdminTable from "../components/AdminTable";
import AdminButton from "../components/AdminButton";

const MyHistory = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const getAllBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/booking/get-allUserBookings/${currentUser?._id}?searchTerm=${search}`
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
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 p-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Booking History</h1>
          <p className="text-sm text-slate-500">
            View all your past and cancelled bookings.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto">
          <input
            className="border border-slate-300 rounded-lg p-2 text-sm w-full sm:w-64"
            type="text"
            placeholder="Search"
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

      {!loading && allBookings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-600 text-lg">No booking history found</p>
          <p className="text-slate-500 text-sm mt-2">Your booking history will appear here</p>
        </div>
      )}

      {allBookings.length > 0 && (
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
              allBookings.map((booking) => {
                const showDeleteButton = new Date(booking?.date).getTime() < new Date().getTime() || booking?.status === "Cancelled";
                return (
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
                      {showDeleteButton ? (
                        <AdminButton
                          variant="danger"
                          size="sm"
                          onClick={() => handleHistoryDelete(booking._id)}
                        >
                          Delete
                        </AdminButton>
                      ) : (
                        <span className="text-slate-400 text-sm">Active</span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </AdminTable>
      )}
    </div>
  );
};

export default MyHistory;
