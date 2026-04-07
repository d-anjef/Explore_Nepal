import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import AdminPageShell from "./AdminPageShell";
import AdminTable from "../components/AdminTable";
import AdminButton from "../components/AdminButton";

const AllUsers = () => {
  const [allUser, setAllUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [guideEmails, setGuideEmails] = useState(new Set());

  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/getAllUsers?searchTerm=${search}`);
      const data = await res.json();

      if (data && data?.success === false) {
        setLoading(false);
        setError(data?.message);
      } else {
        setLoading(false);
        setAllUsers(data);
        setError(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getApprovedGuides = async () => {
    try {
      const res = await fetch('/api/guide-application/get-all-applications?status=approved');
      const data = await res.json();
      
      if (data.success && data.applications) {
        const emails = new Set(data.applications.map(app => app.email));
        setGuideEmails(emails);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUsers();
    getApprovedGuides();
    if (search) getUsers();
  }, [search]);

  const handleUserDelete = async (userId) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Delete User Account?</p>
        <p className="text-sm text-gray-600">This action cannot be undone. The account will be permanently deleted!</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              performUserDelete(userId);
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

  const performUserDelete = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/delete-user/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data?.success === false) {
        setLoading(false);
        toast.error("Something went wrong!");
        return;
      }
      setLoading(false);
      toast.success(data?.message);
      getUsers();
    } catch (error) {
      setLoading(false);
      toast.error("Failed to delete user");
    }
  };

  return (
    <AdminPageShell>
      <div className="w-full flex justify-center">
        <div className="w-full max-w-6xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">All Users</h1>
              <p className="text-sm text-slate-500">
                {loading
                  ? "Loading users..."
                  : `Total Users: ${allUser.length ? allUser.length : 0}`}
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1">
              <input
                type="text"
                className="p-2 rounded-lg border border-slate-300 text-sm w-full sm:w-64"
                placeholder="Search name, email or phone..."
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
            </div>
          </div>

          {error && (
            <p className="text-center text-red-600 text-sm font-medium">{error}</p>
          )}

          <AdminTable>
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  ID
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Address
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {allUser &&
                allUser.map((user) => {
                  const isGuide = guideEmails.has(user.email);
                  return (
                  <tr
                    key={user._id}
                    className="border-b last:border-b-0 hover:bg-slate-50/80"
                  >
                    <td className="px-3 py-2 align-middle text-xs text-slate-500 max-w-[160px] truncate">
                      {user._id}
                    </td>
                    <td className="px-3 py-2 align-middle text-sm font-medium text-slate-800">
                      {user.username}
                    </td>
                    <td className="px-3 py-2 align-middle text-sm text-slate-700">
                      {user.email}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      {isGuide ? (
                        <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                          Guide
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-middle text-sm text-slate-700">
                      {user.address}
                    </td>
                    <td className="px-3 py-2 align-middle text-sm text-slate-700">
                      {user.phone}
                    </td>
                    <td className="px-3 py-2 align-middle text-center">
                      <AdminButton
                        variant="danger"
                        size="sm"
                        title="Delete user"
                        disabled={loading}
                        onClick={() => handleUserDelete(user._id)}
                        className="inline-flex items-center gap-1"
                      >
                        <FaTrash className="text-xs" />
                        <span>Delete</span>
                      </AdminButton>
                    </td>
                  </tr>
                );
                })}
            </tbody>
          </AdminTable>
        </div>
      </div>
    </AdminPageShell>
  );
};

export default AllUsers;
