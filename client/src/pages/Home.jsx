import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./styles/Home.css";
import { FaCalendar, FaSearch, FaStar } from "react-icons/fa";
import { FaRankingStar } from "react-icons/fa6";
import { LuBadgePercent } from "react-icons/lu";
import PackageCard from "./PackageCard";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [recommendedPackages, setRecommendedPackages] = useState([]);
  const [topPackages, setTopPackages] = useState([]);
  const [latestPackages, setLatestPackages] = useState([]);
  const [offerPackages, setOfferPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [hasBookings, setHasBookings] = useState(false);

  const getRecommendedPackages = useCallback(async () => {
    try {
      setLoading(true);
      const userId = currentUser?._id || "";
      const res = await fetch(
        `/api/package/get-recommended-packages?userId=${userId}&limit=8`
      );
      const data = await res.json();
      if (data?.success) {
        setRecommendedPackages(data?.packages);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }, [currentUser]);

  const checkUserBookings = useCallback(async () => {
    if (currentUser?._id) {
      try {
        const res = await fetch(`/api/booking/get-user-bookings/${currentUser._id}`);
        const data = await res.json();
        if (data?.success && data?.bookings?.length > 0) {
          setHasBookings(true);
        } else {
          setHasBookings(false);
        }
      } catch (error) {
        console.log(error);
        setHasBookings(false);
      }
    } else {
      setHasBookings(false);
    }
  }, [currentUser]);

  const getTopPackages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "/api/package/get-packages?sort=packageRating&limit=8"
      );
      const data = await res.json();
      if (data?.success) {
        setTopPackages(data?.packages);
        setLoading(false);
      } else {
        setLoading(false);
        toast.error(data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
    }
  }, [topPackages]);

  const getLatestPackages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "/api/package/get-packages?sort=createdAt&limit=8"
      );
      const data = await res.json();
      if (data?.success) {
        setLatestPackages(data?.packages);
        setLoading(false);
      } else {
        setLoading(false);
        toast.error(data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
    }
  }, [latestPackages]);

  const getOfferPackages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "/api/package/get-packages?sort=createdAt&offer=true&limit=20"
      );
      const data = await res.json();
      if (data?.success) {
        // Sort by discount percentage (highest first)
        const sortedByDiscount = data.packages.sort((a, b) => {
          const discountA = a.packageOffer && a.packageDiscountPrice 
            ? ((a.packagePrice - a.packageDiscountPrice) / a.packagePrice) * 100 
            : 0;
          const discountB = b.packageOffer && b.packageDiscountPrice 
            ? ((b.packagePrice - b.packageDiscountPrice) / b.packagePrice) * 100 
            : 0;
          return discountB - discountA; // Highest discount first
        });
        
        // Take only top 8 with highest discounts
        setOfferPackages(sortedByDiscount.slice(0, 8));
        setLoading(false);
      } else {
        setLoading(false);
        toast.error(data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
    }
  }, [offerPackages]);

  useEffect(() => {
    checkUserBookings();
    getRecommendedPackages();
    getTopPackages();
    getLatestPackages();
    getOfferPackages();
  }, []);

  return (
    <div className="main w-full">
      <div className="w-full flex flex-col">
        <div className="backaground_image w-full"></div>
        <div className="top-part w-full gap-2 flex flex-col">
          <h1 className="text-white text-3xl text-center sm:text-4xl font-bold">
            Explore Nepal With Our Amazing Packages
          </h1>
          <div className="w-full flex justify-center items-center gap-2 mt-8">
            <input
              type="text"
              className="rounded-lg outline-none w-[230px] sm:w-2/5 p-2 border border-black bg-opacity-40 bg-white text-white placeholder:text-white font-semibold"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            <button
              onClick={() => {
                navigate(`/search?searchTerm=${search}`);
              }}
              className="bg-white w-10 h-10 flex justify-center items-center text-xl font-semibold rounded-full hover:scale-95"
            >
              Go
              {/* <FaSearch className="" /> */}
            </button>
          </div>
          {/* Request Guide Button */}
          <div className="w-full flex justify-center mt-6">
            <button
              onClick={() => navigate("/request-guide")}
              className="bg-green-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-700 hover:scale-105 transition-all duration-150 shadow-lg"
            >
              🧭 Find Your Perfect Guide
            </button>
          </div>

          <div className="w-[90%] max-w-xl flex justify-center mt-6">
            <button
              onClick={() => {
                navigate("/search?offer=true");
              }}
              className="flex items-center justify-around gap-x-1 bg-slate-400 text-white p-2 py-1 text-[8px] xxsm:text-sm sm:text-lg border-e border-white rounded-s-full flex-1 hover:scale-105 transition-all duration-150"
            >
              Best Offers
              <LuBadgePercent className="text-2xl" />
            </button>
            <button
              onClick={() => {
                navigate("/search?sort=packageRating");
              }}
              className="flex items-center justify-around gap-x-1 bg-slate-400 text-white p-2 py-1 text-[8px] xxsm:text-sm sm:text-lg border-x border-white flex-1 hover:scale-105 transition-all duration-150"
            >
              Top Rated
              <FaStar className="text-2xl" />
            </button>
            <button
              onClick={() => {
                navigate("/search?sort=createdAt");
              }}
              className="flex items-center justify-around gap-x-1 bg-slate-400 text-white p-2 py-1 text-[8px] xxsm:text-sm sm:text-lg border-x border-white flex-1 hover:scale-105 transition-all duration-150"
            >
              Latest
              <FaCalendar className="text-lg" />
            </button>
            <button
              onClick={() => {
                navigate("/search?sort=packageTotalRatings");
              }}
              className="flex items-center justify-around gap-x-1 bg-slate-400 text-white p-2 py-1 text-[8px] xxsm:text-sm sm:text-lg border-s border-white rounded-e-full flex-1 hover:scale-105 transition-all duration-150"
            >
              Most Rated
              <FaRankingStar className="text-2xl" />
            </button>
          </div>
        </div>
        {/* Nepal Destinations Section */}
        <div className="w-full bg-gradient-to-b from-blue-50 to-white py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                Explore Nepal's Top Destinations
              </h2>
              <p className="text-gray-600 text-lg">
                Discover the beauty and culture of Nepal's most iconic places
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Kathmandu */}
              <div 
                onClick={() => navigate("/search?searchTerm=kathmandu")}
                className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="aspect-[4/5] relative">
                  <img
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop&q=75&auto=format"
                    alt="Kathmandu"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">Kathmandu</h3>
                    <p className="text-sm opacity-90">Capital city with ancient temples and vibrant culture</p>
                  </div>
                </div>
              </div>

              {/* Pokhara */}
              <div 
                onClick={() => navigate("/search?searchTerm=pokhara")}
                className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="aspect-[4/5] relative">
                  <img
                    src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=500&fit=crop&q=75&auto=format"
                    alt="Pokhara"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">Pokhara</h3>
                    <p className="text-sm opacity-90">Gateway to Annapurna with stunning lake views</p>
                  </div>
                </div>
              </div>

              {/* Chitwan */}
              <div 
                onClick={() => navigate("/search?searchTerm=chitwan")}
                className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="aspect-[4/5] relative">
                  <img
                    src="https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&h=500&fit=crop&q=75&auto=format"
                    alt="Chitwan"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">Chitwan</h3>
                    <p className="text-sm opacity-90">Wildlife safari and jungle adventures</p>
                  </div>
                </div>
              </div>

              {/* Everest Region */}
              <div 
                onClick={() => navigate("/search?searchTerm=everest")}
                className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="aspect-[4/5] relative">
                  <img
                    src="https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=400&h=500&fit=crop&q=75&auto=format"
                    alt="Everest Region"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">Everest Region</h3>
                    <p className="text-sm opacity-90">Trek to the base of the world's highest peak</p>
                  </div>
                </div>
              </div>

              {/* Nagarkot */}
              <div 
                onClick={() => navigate("/search?searchTerm=nagarkot")}
                className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="aspect-[4/5] relative">
                  <img
                    src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400&h=500&fit=crop&q=75&auto=format"
                    alt="Nagarkot"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">Nagarkot</h3>
                    <p className="text-sm opacity-90">Spectacular sunrise views over the Himalayas</p>
                  </div>
                </div>
              </div>

              {/* Annapurna */}
              <div 
                onClick={() => navigate("/search?searchTerm=annapurna")}
                className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="aspect-[4/5] relative">
                  <img
                    src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=500&fit=crop&q=75&auto=format&sat=-20"
                    alt="Annapurna"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">Annapurna</h3>
                    <p className="text-sm opacity-90">World-famous trekking circuit with diverse landscapes</p>
                  </div>
                </div>
              </div>

              {/* Bhaktapur */}
              <div 
                onClick={() => navigate("/search?searchTerm=bhaktapur")}
                className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="aspect-[4/5] relative">
                  <img
                    src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400&h=500&fit=crop&q=75&auto=format&hue=30"
                    alt="Bhaktapur"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">Bhaktapur</h3>
                    <p className="text-sm opacity-90">Medieval city with preserved architecture and art</p>
                  </div>
                </div>
              </div>

              {/* Lumbini Buddhist Pilgrimage */}
              <div 
                onClick={() => navigate("/search?searchTerm=lumbini")}
                className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="aspect-[4/5] relative">
                  <img
                    src="https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=500&fit=crop&q=75&auto=format"
                    alt="Lumbini Buddhist Pilgrimage"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">Lumbini Buddhist Pilgrimage</h3>
                    <p className="text-sm opacity-90">Birthplace of Lord Buddha, UNESCO World Heritage Site</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* main page */}
        <div className="main p-6 flex flex-col gap-5">
          {loading && <h1 className="text-center text-2xl">Loading...</h1>}
          {!loading &&
            recommendedPackages.length === 0 &&
            topPackages.length === 0 &&
            latestPackages.length === 0 &&
            offerPackages.length === 0 && (
              <h1 className="text-center text-2xl">No Packages Yet!</h1>
            )}
          
          {/* For users WITHOUT bookings: Show Top Packages first */}
          {!hasBookings && (
            <>
              {/* Top Rated */}
              {!loading && topPackages.length > 0 && (
                <>
                  <h1 className="text-2xl font-semibold">Top Packages</h1>
                  <div className="grid 2xl:grid-cols-5 xlplus:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-2 my-3">
                    {topPackages.map((packageData, i) => {
                      return <PackageCard key={i} packageData={packageData} />;
                    })}
                  </div>
                </>
              )}
              {/* Top Rated */}
              {/* Recommended */}
              {!loading && recommendedPackages.length > 0 && (
                <>
                  <h1 className="text-2xl font-semibold">
                    {currentUser ? "Recommended for You" : "Recommended Packages"}
                  </h1>
                  <div className="grid 2xl:grid-cols-5 xlplus:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-2 my-3">
                    {recommendedPackages.map((packageData, i) => {
                      return <PackageCard key={i} packageData={packageData} />;
                    })}
                  </div>
                </>
              )}
              {/* Recommended */}
            </>
          )}

          {/* For users WITH bookings: Show Recommended first */}
          {hasBookings && (
            <>
              {/* Recommended */}
              {!loading && recommendedPackages.length > 0 && (
                <>
                  <h1 className="text-2xl font-semibold">
                    {currentUser ? "Recommended for You" : "Recommended Packages"}
                  </h1>
                  <div className="grid 2xl:grid-cols-5 xlplus:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-2 my-3">
                    {recommendedPackages.map((packageData, i) => {
                      return <PackageCard key={i} packageData={packageData} />;
                    })}
                  </div>
                </>
              )}
              {/* Recommended */}
              {/* Top Rated */}
              {!loading && topPackages.length > 0 && (
                <>
                  <h1 className="text-2xl font-semibold">Top Packages</h1>
                  <div className="grid 2xl:grid-cols-5 xlplus:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-2 my-3">
                    {topPackages.map((packageData, i) => {
                      return <PackageCard key={i} packageData={packageData} />;
                    })}
                  </div>
                </>
              )}
              {/* Top Rated */}
            </>
          )}

          {/* latest */}
          {!loading && latestPackages.length > 0 && (
            <>
              <h1 className="text-2xl font-semibold">Latest Packages</h1>
              <div className="grid 2xl:grid-cols-5 xlplus:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-2 my-3">
                {latestPackages.map((packageData, i) => {
                  return <PackageCard key={i} packageData={packageData} />;
                })}
              </div>
            </>
          )}
          {/* latest */}
          {/* offer */}
          {!loading && offerPackages.length > 0 && (
            <>
              <div className="offers_img"></div>
              <h1 className="text-2xl font-semibold">Best Offers</h1>
              <div className="grid 2xl:grid-cols-5 xlplus:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-2 my-3">
                {offerPackages.map((packageData, i) => {
                  return <PackageCard key={i} packageData={packageData} />;
                })}
              </div>
            </>
          )}
          {/* offer */}
        </div>
      </div>
    </div>
  );
};

export default Home;
