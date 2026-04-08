import React, { useState, useEffect } from "react";
import { FaSearch, FaRegFrown } from "react-icons/fa";
import PackageCard from "./PackageCard";

const PackageSearch = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 1. All filters in one state object
  const [filters, setFilters] = useState({
    searchTerm: "",
    category: "All",
    maxPrice: 500000,
    sort: "createdAt_desc"
  });

  const categories = ["All", "Trekking", "Luxury", "Cultural", "Adventure"];

  // 2. THE ENGINE: This effect runs EVERY time 'filters' changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          searchTerm: filters.searchTerm,
          category: filters.category !== "All" ? filters.category : "",
          maxPrice: filters.maxPrice,
          sort: filters.sort
        }).toString();

        const res = await fetch(`/api/package/get?${query}`);
        const data = await res.json();
        
        if (data.success) {
          setPackages(data.packages);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce: Wait 400ms after the last change before calling API
    const timer = setTimeout(() => {
      fetchData();
    }, 400);

    return () => clearTimeout(timer);
  }, [filters]); // <--- This array is why it works without a button

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Title Section */}
        <div className="mb-10">
          <h1 className="text-5xl font-black uppercase tracking-tighter">
            Live <span className="text-indigo-600">Explorer</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">
            {loading ? "Searching database..." : `Displaying ${packages.length} results`}
          </p>
        </div>

        {/* FILTER BOX: Pure Tailwind, no external CSS */}
        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 mb-12 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-end">
            
            {/* Text Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="text"
                  name="searchTerm"
                  placeholder="Where to?"
                  value={filters.searchTerm}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-4 bg-white border-none rounded-2xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-black transition-all outline-none"
                />
              </div>
            </div>

            {/* Price Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Max Budget</label>
                <span className="text-[10px] font-black text-indigo-600">Rs {filters.maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                name="maxPrice"
                min="5000"
                max="500000"
                step="5000"
                value={filters.maxPrice}
                onChange={handleInputChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
            </div>

            {/* Category Chips */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilters({ ...filters, category: cat })}
                    className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                      filters.category === cat 
                      ? "bg-black text-white border-black" 
                      : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sort By</label>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleInputChange}
                className="w-full py-4 px-4 bg-white border-none rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm focus:ring-2 focus:ring-black outline-none"
              >
                <option value="createdAt_desc">Latest Arrivals</option>
                <option value="packagePrice_asc">Cheapest First</option>
                <option value="packagePrice_desc">Expensive First</option>
                <option value="packageRating_desc">Top Rated</option>
              </select>
            </div>

          </div>
        </div>

        {/* RESULTS */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/5] bg-slate-100 rounded-[2.5rem] animate-pulse" />
              ))}
            </div>
          ) : packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {packages.map((pkg) => (
                <PackageCard key={pkg._id} packageData={pkg} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-[3rem]">
              <FaRegFrown className="text-slate-200 mb-4" size={40} />
              <h3 className="text-xl font-black uppercase tracking-widest">No Matches</h3>
              <button 
                onClick={() => setFilters({ searchTerm: "", category: "All", maxPrice: 500000, sort: "createdAt_desc" })}
                className="mt-4 text-[10px] font-black uppercase underline hover:text-indigo-600"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageSearch;