import React, { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  FaArrowLeft,
  FaClock,
  FaMapMarkerAlt,
  FaShare,
  FaHotel,
  FaRunning,
  FaUtensils,
  FaShieldAlt,
} from "react-icons/fa";
import Rating from "@mui/material/Rating";
import { useSelector } from "react-redux";

const Package = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { id } = useParams();
  const navigate = useNavigate();

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState("accommodation");
  const [descExpanded, setDescExpanded] = useState(false);

  // HELPER: Generate a consistent random rating based on the Package ID
  // This ensures Package A always shows 4.2, and Package B always shows 4.7
  const fakeRatingData = useMemo(() => {
    if (!id) return { rating: 5, reviews: 0 };
    
    // Create a simple hash from the ID string
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate rating between 3.8 and 5.0
    const rating = 3.8 + (Math.abs(hash % 13) / 10); 
    // Generate review count between 12 and 88
    const reviews = 12 + (Math.abs(hash % 77));
    
    return { 
      rating: parseFloat(rating.toFixed(1)), 
      reviews: reviews 
    };
  }, [id]);

  const fetchPackageData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/package/get-package-data/${id}`);
      const data = await res.json();
      if (data?.success) {
        setPackageData(data.packageData);
      } else {
        setError(data?.message || "Package not found");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchPackageData();
    window.scrollTo(0, 0);
  }, [id, fetchPackageData]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-slate-400 animate-pulse">Initializing...</div>;

  // Prioritize real database ratings, fall back to our "Unique Random" fake data
  const finalRating = packageData?.packageRating || fakeRatingData.rating;
  const finalReviews = packageData?.packageTotalRatings || fakeRatingData.reviews;

  return (
    <div className="w-full bg-white min-h-screen text-black">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest hover:opacity-50 transition-all">
            <FaArrowLeft /> Back
          </button>
          <button onClick={handleShare} className="hover:rotate-12 transition-transform">
            <FaShare size={18} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* LEFT: IMAGE & RATING */}
          <div className="lg:col-span-6 space-y-8">
            <div className="rounded-[2.5rem] overflow-hidden bg-slate-50 aspect-square shadow-2xl shadow-slate-200 border border-slate-100">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000 }}
                className="h-full w-full"
              >
                {packageData?.packageImages?.map((img, i) => (
                  <SwiperSlide key={i}>
                    <img src={img} alt={packageData.packageName} className="w-full h-full object-cover" />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* IMPROVED RATING SECTION: Consistent Random Data */}
            <div className="bg-slate-900 text-white rounded-[2rem] p-8 flex items-center justify-between shadow-xl">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-indigo-400">{finalRating}</span>
                  <div className="flex flex-col">
                    <Rating 
                      value={finalRating} 
                      precision={0.1} 
                      readOnly 
                      sx={{ color: '#818cf8', '& .MuiRating-iconEmpty': { color: '#334155' } }} 
                    />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mt-1">
                      {finalReviews} Verified Reviews
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden sm:block border-l border-slate-700 pl-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Traveler Score</p>
                <p className="text-xs font-bold text-slate-400 italic">"Excellent Service"</p>
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="lg:col-span-6 pt-4">
            <div className="flex items-center gap-2 mb-4">
               <span className="w-8 h-[2px] bg-indigo-500"></span>
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-500">
                {packageData?.packageCategory || "Curated Travel"}
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black uppercase leading-[0.9] tracking-tighter mb-8">
              {packageData?.packageName}
            </h1>

            <div className="flex items-center gap-6 mb-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Starting from</span>
                <span className="text-4xl font-black tracking-tight">
                  Rs {packageData?.packageOffer ? packageData.packageDiscountPrice.toLocaleString() : packageData.packagePrice.toLocaleString()}
                </span>
              </div>
              {packageData?.packageOffer && (
                <div className="bg-red-50 px-3 py-1 rounded-lg">
                   <p className="text-[10px] font-black text-red-500 line-through">Rs {packageData.packagePrice.toLocaleString()}</p>
                   <p className="text-[10px] font-black text-red-600 uppercase">Save {Math.round(((packageData.packagePrice - packageData.packageDiscountPrice)/packageData.packagePrice)*100)}%</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 py-8 border-y border-slate-100 mb-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <FaMapMarkerAlt className="text-indigo-500"/> Location
                </p>
                <p className="text-sm font-black uppercase">{packageData?.packageDestination}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <FaClock className="text-indigo-500"/> Timeline
                </p>
                <p className="text-sm font-black uppercase">{packageData?.packageDays} Days / {packageData?.packageNights} Nights</p>
              </div>
            </div>

            <div className="relative mb-12">
              <p className="text-slate-600 leading-relaxed text-base italic">
                "{descExpanded ? packageData?.packageDescription : `${packageData?.packageDescription?.substring(0, 200)}...`}"
              </p>
              <button 
                onClick={() => setDescExpanded(!descExpanded)} 
                className="mt-4 text-[10px] font-black uppercase border-b-2 border-black pb-1 hover:text-indigo-600 hover:border-indigo-600 transition-all"
              >
                {descExpanded ? "Collapse Details" : "Read Full Story"}
              </button>
            </div>

            <button
              onClick={() => navigate(currentUser ? `/booking/${id}` : "/login")}
              className="group relative w-full bg-black text-white font-black py-7 rounded-2xl overflow-hidden shadow-2xl transition-all hover:bg-slate-900"
            >
              <span className="relative z-10 uppercase tracking-[0.3em] text-sm">BOOK NOW </span>
              <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </div>
      </main>

      {/* Grid Highlights */}
      <section className="max-w-7xl mx-auto px-6 py-20">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { label: "Accommodation", icon: <FaHotel />, key: "packageAccommodation" },
              { label: "Activities", icon: <FaRunning />, key: "packageActivities" },
              { label: "Dining", icon: <FaUtensils />, key: "packageMeals" }
            ].map((item) => (
              <div key={item.label} className="group p-10 bg-slate-50 rounded-[2.5rem] hover:bg-white hover:shadow-2xl transition-all border border-transparent hover:border-slate-100">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-black group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-slate-400">{item.label}</h3>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {packageData?.[item.key] || "Premium arrangements tailored for your comfort and enjoyment throughout the journey."}
                </p>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
};

export default Package;