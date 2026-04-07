import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PackageCard from "./PackageCard";

const Search = () => {
  const navigate = useNavigate();
  const [sideBarSearchData, setSideBarSearchData] = useState({
    searchTerm: "",
    offer: false,
    sort: "created_at",
    order: "desc",
  });
  const [loading, setLoading] = useState(false);
  const [allPackages, setAllPackages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  //   console.log(listings);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const offerFromUrl = urlParams.get("offer");
    const sortFromUrl = urlParams.get("sort");
    const orderFromUrl = urlParams.get("order");

    if (searchTermFromUrl || offerFromUrl || sortFromUrl || orderFromUrl) {
      setSideBarSearchData({
        searchTerm: searchTermFromUrl || "",
        offer: offerFromUrl === "true" ? true : false,
        sort: sortFromUrl || "created_at",
        order: orderFromUrl || "desc",
      });
    }

    const fetchAllPackages = async () => {
      setLoading(true);
      try {
        const searchQuery = urlParams.toString();
        const res = await fetch(`/api/package/get-packages?${searchQuery}`);
        const data = await res.json();
        setLoading(false);
        
        // If offer filter is active, sort by discount percentage (highest first)
        if (offerFromUrl === "true" && data?.packages) {
          const sortedByDiscount = data.packages.sort((a, b) => {
            const discountA = a.packageOffer && a.packageDiscountPrice 
              ? ((a.packagePrice - a.packageDiscountPrice) / a.packagePrice) * 100 
              : 0;
            const discountB = b.packageOffer && b.packageDiscountPrice 
              ? ((b.packagePrice - b.packageDiscountPrice) / b.packagePrice) * 100 
              : 0;
            return discountB - discountA; // Highest discount first
          });
          setAllPackages(sortedByDiscount);
        } else {
          setAllPackages(data?.packages);
        }
        
        setHasMore(data?.packages?.length >= 9);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    fetchAllPackages();
  }, [location.search]);

  const handleChange = (e) => {
    if (e.target.id === "searchTerm") {
      setSideBarSearchData({
        ...sideBarSearchData,
        searchTerm: e.target.value,
      });
    }
    if (e.target.id === "offer") {
      setSideBarSearchData({
        ...sideBarSearchData,
        [e.target.id]:
          e.target.checked || e.target.checked === "true" ? true : false,
      });
    }
    if (e.target.id === "sort_order") {
      const sort = e.target.value.split("_")[0] || "created_at";

      const order = e.target.value.split("_")[1] || "desc";

      setSideBarSearchData({ ...sideBarSearchData, sort, order });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const urlParams = new URLSearchParams();
    urlParams.set("searchTerm", sideBarSearchData.searchTerm);
    urlParams.set("offer", sideBarSearchData.offer);
    urlParams.set("sort", sideBarSearchData.sort);
    urlParams.set("order", sideBarSearchData.order);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    const numberOfPackages = allPackages.length;
    const startIndex = numberOfPackages;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", startIndex);
    const searchQuery = urlParams.toString();
    const offerFromUrl = urlParams.get("offer");
    
    setLoading(true);
    const res = await fetch(`/api/package/get-packages?${searchQuery}`);
    const data = await res.json();
    setLoading(false);
    
    if (data?.packages?.length < 9) {
      setHasMore(false);
    }
    
    // If offer filter is active, sort new packages by discount before appending
    let newPackages = data?.packages || [];
    if (offerFromUrl === "true" && newPackages.length > 0) {
      newPackages = newPackages.sort((a, b) => {
        const discountA = a.packageOffer && a.packageDiscountPrice 
          ? ((a.packagePrice - a.packageDiscountPrice) / a.packagePrice) * 100 
          : 0;
        const discountB = b.packageOffer && b.packageDiscountPrice 
          ? ((b.packagePrice - b.packageDiscountPrice) / b.packagePrice) * 100 
          : 0;
        return discountB - discountA;
      });
    }
    
    setAllPackages([...allPackages, ...newPackages]);
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
  }, [loading, hasMore, allPackages]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="p-7 border-b-2 md:border-r-2 md:min-w-[300px] md:max-w-[350px] bg-white md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">Search:</label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Search"
              className="border rounded-lg p-3 w-full"
              value={sideBarSearchData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Type:</label>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                checked={sideBarSearchData.offer}
                onChange={handleChange}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>
            <select
              onChange={handleChange}
              defaultValue={"created_at_desc"}
              id="sort_order"
              className="p-3 border rounded-lg"
            >
              <option value="packagePrice_desc">Price high to low</option>
              <option value="packagePrice_asc">Price low to high</option>
              <option value="packageRating_desc">Top Rated</option>
              <option value="packageTotalRatings_desc">Most Rated</option>
              <option value="createdAt_desc">Latest</option>
              <option value="createdAt_asc">Oldest</option>
            </select>
          </div>
          <button className="bg-slate-700 rounded-lg text-white p-3 uppercase hover:opacity-95">
            Search
          </button>
        </form>
      </div>
      {/* ------------------------------------------------------------------------------- */}
      <div className="flex-1 bg-gray-50">
        <h1 className="text-xl font-semibold border-b p-3 text-slate-700 bg-white">
          Package Results:
        </h1>
        <div className="w-full p-5 grid 2xl:grid-cols-4 xlplus:grid-cols-3 lg:grid-cols-2 gap-4">
          {!loading && allPackages.length === 0 && (
            <p className="text-xl text-slate-700">No Packages Found!</p>
          )}
          {loading && (
            <p className="text-xl text-slate-700 text-center w-full">
              Loading...
            </p>
          )}
          {!loading &&
            allPackages &&
            allPackages.map((packageData, i) => (
              <div 
                key={i} 
                ref={i === allPackages.length - 1 ? lastPackageRef : null}
              >
                <PackageCard packageData={packageData} />
              </div>
            ))}
        </div>
        {loading && (
          <div className="text-center text-sm text-gray-600 p-4">
            Loading more packages...
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
