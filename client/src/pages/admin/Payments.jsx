import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AdminPageShell from "./AdminPageShell";
import AdminTable from "../components/AdminTable";

const Payments = () => {
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

  return (
    <AdminPageShell>
      <div className="w-full max-w-6xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Payments</h1>
            <p className="text-sm text-slate-500">
              Review all completed bookings and their payment amounts.
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
                Total
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
                  <td className="px-3 py-2 align-middle text-right text-sm font-semibold text-slate-800">
                    Rs {booking?.totalPrice}
                  </td>
                </tr>
              ))}
          </tbody>
        </AdminTable>
      </div>
    </AdminPageShell>
  );
};

export default Payments;
