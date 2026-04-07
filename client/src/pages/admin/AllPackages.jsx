import React, { useEffect, useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import AdminPageShell from "./AdminPageShell";
import AdminButton from "../components/AdminButton";
import AdminTable from "../components/AdminTable";

const AllPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const getPackages = async () => {
    setPackages([]);
    try {
      setLoading(true);
      let url =
        filter === "offer" //offer
          ? `/api/package/get-packages?searchTerm=${search}&offer=true`
          : filter === "latest" //latest
          ? `/api/package/get-packages?searchTerm=${search}&sort=createdAt`
          : filter === "top" //top rated
          ? `/api/package/get-packages?searchTerm=${search}&sort=packageRating`
          : `/api/package/get-packages?searchTerm=${search}`; //all
      const res = await fetch(url);
      const data = await res.json();
      if (data?.success) {
        setPackages(data?.packages);
        setLoading(false);
      } else {
        setLoading(false);
        toast.error(data?.message || "Something went wrong!");
      }
      setHasMore(data?.packages?.length >= 9);
    } catch (error) {
      console.log(error);
    }
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    const numberOfPackages = packages.length;
    const startIndex = numberOfPackages;
    let url =
      filter === "offer"
        ? `/api/package/get-packages?searchTerm=${search}&offer=true&startIndex=${startIndex}`
        : filter === "latest"
        ? `/api/package/get-packages?searchTerm=${search}&sort=createdAt&startIndex=${startIndex}`
        : filter === "top"
        ? `/api/package/get-packages?searchTerm=${search}&sort=packageRating&startIndex=${startIndex}`
        : `/api/package/get-packages?searchTerm=${search}&startIndex=${startIndex}`;
    
    setLoading(true);
    const res = await fetch(url);
    const data = await res.json();
    setLoading(false);
    
    if (data?.packages?.length < 9) {
      setHasMore(false);
    }
    setPackages([...packages, ...data?.packages]);
  };

  const lastPackageRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, packages]);

  useEffect(() => {
    getPackages();
  }, [filter, search]);

  const handleDelete = async (packageId) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Delete Package?</p>
        <p className="text-sm text-gray-600">This action cannot be undone. The package will be permanently deleted!</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              performDelete(packageId);
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

  const performDelete = async (packageId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/package/delete-package/${packageId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      toast.success(data?.message);
      getPackages();
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete package");
      setLoading(false);
    }
  };

  return (
    <AdminPageShell>
      <div className="shadow-xl rounded-lg w-full flex flex-col p-5 justify-center gap-3 bg-white">
        {loading && <h1 className="text-center text-lg">Loading...</h1>}

        {/* Header + primary actions */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Packages</h1>
            <p className="text-sm text-slate-500">
              Manage all travel packages, offers and featured trips.
            </p>
          </div>
          <Link to="/admin/packages/add" className="self-start sm:self-auto">
            <AdminButton variant="primary" size="md" className="flex items-center gap-2">
              <span className="text-lg leading-none">+</span>
              <span>Add package</span>
            </AdminButton>
          </Link>
        </div>

        {/* Search + filter row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="w-full sm:w-72">
            <input
              className="w-full p-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Search packages..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Filter
            </span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="offer">Offer</option>
              <option value="latest">Latest</option>
              <option value="top">Top</option>
            </select>
          </div>
        </div>

        {/* packages */}
        <AdminTable>
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Package
              </th>
              <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Price
              </th>
              <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Offer
              </th>
              <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Rating
              </th>
              <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {packages && packages.length > 0 ? (
              packages.map((pack, index) => (
                <tr
                  key={pack._id}
                  ref={index === packages.length - 1 ? lastPackageRef : null}
                  className="border-b last:border-b-0 hover:bg-slate-50/80"
                >
                  <td className="px-3 py-2 align-middle">
                    <div className="flex items-center gap-2">
                      <Link to={`/package/${pack._id}`}>
                        <img
                          src={pack?.packageImages?.[0] || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"}
                          alt={pack?.packageName || "Package"}
                          className="w-12 h-12 rounded object-cover"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop";
                          }}
                        />
                      </Link>
                      <Link to={`/package/${pack._id}`}>
                        <p className="font-medium text-sm text-slate-800 hover:underline">
                          {pack?.packageName}
                        </p>
                      </Link>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-middle text-sm text-slate-700 whitespace-nowrap">
                    {pack?.packageOffer && pack?.packageDiscountPrice ? (
                      <>
                        <span className="font-semibold text-emerald-600 mr-1">
                          Rs {pack.packageDiscountPrice}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          Rs {pack.packagePrice}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold text-slate-800">
                        Rs {pack?.packagePrice}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-middle text-sm text-slate-700">
                    {pack?.packageOffer ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                        Offer
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-middle text-sm text-slate-700">
                    {typeof pack?.packageRating === "number" ? (
                      <span>{pack.packageRating.toFixed(1)}</span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-middle text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link to={`/admin/packages/update/${pack._id}`}>
                        <AdminButton
                          variant="outline"
                          size="sm"
                          disabled={loading}
                        >
                          {loading ? "Loading..." : "Edit"}
                        </AdminButton>
                      </Link>
                      <AdminButton
                        variant="danger"
                        size="sm"
                        disabled={loading}
                        onClick={() => handleDelete(pack?._id)}
                      >
                        {loading ? "Loading..." : "Delete"}
                      </AdminButton>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-sm text-slate-500"
                >
                  No packages available.
                </td>
              </tr>
            )}
          </tbody>
        </AdminTable>
        {loading && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Loading more packages...
          </div>
        )}
      </div>
    </AdminPageShell>
  );
};

export default AllPackages;
