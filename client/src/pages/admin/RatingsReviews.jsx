import { Rating } from "@mui/material";
import React, { useEffect, useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import AdminPageShell from "./AdminPageShell";
import AdminTable from "../components/AdminTable";
import AdminButton from "../components/AdminButton";

const RatingsReviews = () => {
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
        filter === "most" //most rated
          ? `/api/package/get-packages?searchTerm=${search}&sort=packageTotalRatings`
          : `/api/package/get-packages?searchTerm=${search}&sort=packageRating`; //all
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

  useEffect(() => {
    getPackages();
  }, [filter, search]);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    const numberOfPackages = packages.length;
    const startIndex = numberOfPackages;
    let url =
      filter === "most"
        ? `/api/package/get-packages?searchTerm=${search}&sort=packageTotalRatings&startIndex=${startIndex}`
        : `/api/package/get-packages?searchTerm=${search}&sort=packageRating&startIndex=${startIndex}`;
    
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

  return (
    <AdminPageShell>
      <div className="shadow-xl rounded-lg w-full flex flex-col p-5 justify-center gap-3 bg-white">
        {loading && <h1 className="text-center text-lg">Loading...</h1>}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Ratings &amp; Reviews</h1>
            <p className="text-sm text-slate-500">
              See which packages are performing best based on guest feedback.
            </p>
          </div>
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
              <option value="most">Most rated</option>
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
                Rating
              </th>
              <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Total Ratings
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
                      <Link to={`/package/ratings/${pack._id}`}>
                        <img
                          src={pack?.packageImages[0]}
                          alt={pack?.packageName || "Package"}
                          className="w-12 h-12 rounded object-cover"
                        />
                      </Link>
                      <Link to={`/package/ratings/${pack._id}`}>
                        <p className="font-medium text-sm text-slate-800 hover:underline">
                          {pack?.packageName}
                        </p>
                      </Link>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-middle text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Rating
                        value={pack?.packageRating}
                        precision={0.1}
                        readOnly
                        size="small"
                      />
                      {typeof pack?.packageRating === "number" && (
                        <span className="text-xs text-slate-600">
                          {pack.packageRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 align-middle text-sm text-slate-700">
                    {pack?.packageTotalRatings ?? 0}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-6 text-center text-sm text-slate-500"
                >
                  No ratings available.
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

export default RatingsReviews;
