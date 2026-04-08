import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { 
  FaCalendar, 
  FaSearch, 
  FaStar, 
  FaQuoteLeft, 
  FaArrowRight, 
  FaCloudSun,
  FaEnvelope,
  FaCheckCircle,
  FaRobot,
  FaTimes,
  FaMagic,
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase
} from "react-icons/fa";
import { FaRankingStar } from "react-icons/fa6";
import { LuBadgePercent } from "react-icons/lu";
import PackageCard from "./PackageCard";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  
  // --- DATA STATES ---
  const [recommendedPackages, setRecommendedPackages] = useState([]);
  const [topPackages, setTopPackages] = useState([]);
  const [latestPackages, setLatestPackages] = useState([]);
  const [offerPackages, setOfferPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [hasBookings, setHasBookings] = useState(false);
  const [weather, setWeather] = useState({ temp: 18, condition: "Clear Skies" });
  
  // --- GUIDE STATES ---
  const [guides, setGuides] = useState([]);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideBookings, setGuideBookings] = useState({});

  // --- AI CONCIERGE STATES ---
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // --- AI SEASONAL LOGIC ---
  const getSeasonalRecommendation = () => {
    setIsTyping(true);
    setAiResponse("");
    
    setTimeout(() => {
      const month = new Date().getMonth(); // 0 = Jan, 3 = April
      let message = "";

      if (month >= 2 && month <= 4) {
        message = "Namaste! It's currently Spring in Nepal. This is the absolute best time for the Everest Base Camp or Annapurna Circuit as the rhododendrons are in full bloom and temperatures are moderate.";
      } else if (month >= 5 && month <= 7) {
        message = "We are entering the Monsoon season. For a dry and breathtaking experience, I recommend the Upper Mustang Trek; it stays rain-free in the Himalayan rain shadow.";
      } else if (month >= 8 && month <= 10) {
        message = "It's Peak Autumn! The skies are perfectly clear. I suggest the Manaslu Circuit or Gokyo Lakes for the most iconic mountain photography.";
      } else {
        message = "Winter is here. To enjoy the Himalayas without extreme cold, I recommend lower altitude luxury treks like Ghorepani Poon Hill or the Mardi Himal Trek.";
      }
      
      setAiResponse(message);
      setIsTyping(false);
    }, 1000);
  };

  // --- API CALLS ---
  const getRecommendedPackages = useCallback(async () => {
    try {
      setLoading(true);
      const userId = currentUser?._id || "";
      const res = await fetch(`/api/package/get-recommended-packages?userId=${userId}&limit=8`);
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType?.includes("application/json")) {
        const data = await res.json();
        if (data?.success) setRecommendedPackages(data?.packages);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }, [currentUser]);

  const checkUserBookings = useCallback(async () => {
    if (currentUser?._id) {
      try {
        const res = await fetch(`/api/booking/get-user-bookings/${currentUser._id}`);
        const data = await res.json();
        setHasBookings(data?.success && data?.bookings?.length > 0);
      } catch (error) {
        setHasBookings(false);
      }
    }
  }, [currentUser]);

  const getTopPackages = useCallback(async () => {
    try {
      const res = await fetch("/api/package/get-packages?sort=packageRating&limit=8");
      const data = await res.json();
      if (data?.success) setTopPackages(data?.packages);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const getLatestPackages = useCallback(async () => {
    try {
      const res = await fetch("/api/package/get-packages?sort=createdAt&limit=8");
      const data = await res.json();
      if (data?.success) setLatestPackages(data?.packages);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const getOfferPackages = useCallback(async () => {
    try {
      const res = await fetch("/api/package/get-packages?sort=createdAt&offer=true&limit=8");
      const data = await res.json();
      if (data?.success) setOfferPackages(data.packages);
    } catch (error) {
      console.error(error);
    }
  }, []);

  // --- FETCH FEATURED GUIDES ---
  const getFeaturedGuides = useCallback(async () => {
    try {
      setGuideLoading(true);
      const res = await fetch("/api/guide-application/get-approved-guides?limit=6");
      const data = await res.json();

      if (data.success) {
        // Fetch guide bookings
        await fetchGuideBookingsData();
        
        // Filter out current user's profile
        const filteredGuides = (data.guides || []).filter(
          (guide) => guide && guide.email && guide.email !== currentUser?.email
        );
        setGuides(filteredGuides.slice(0, 6));
      }
    } catch (error) {
      console.error("Error fetching guides:", error);
    } finally {
      setGuideLoading(false);
    }
  }, [currentUser]);

  const fetchGuideBookingsData = async () => {
    try {
      const res = await fetch('/api/guide-message/get-all-messages', {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        const bookingsMap = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        data.messages.forEach((msg) => {
          if (msg.status === 'approved' && msg.tourDate && msg.tourDays) {
            const tourStartDate = new Date(msg.tourDate);
            tourStartDate.setHours(0, 0, 0, 0);
            
            const tourEndDate = new Date(tourStartDate);
            tourEndDate.setDate(tourEndDate.getDate() + parseInt(msg.tourDays));
            
            if (today >= tourStartDate && today < tourEndDate) {
              bookingsMap[msg.guideEmail] = (bookingsMap[msg.guideEmail] || 0) + 1;
            }
          }
        });
        setGuideBookings(bookingsMap);
      }
    } catch (error) {
      console.error("Error fetching guide bookings:", error);
    }
  };

  useEffect(() => {
    checkUserBookings();
    getRecommendedPackages();
    getTopPackages();
    getLatestPackages();
    getOfferPackages();
    getFeaturedGuides();
  }, [checkUserBookings, getRecommendedPackages, getTopPackages, getLatestPackages, getOfferPackages, getFeaturedGuides]);

  // --- ANIMATION VARIANTS ---
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const destinations = [
    { name: "Kathmandu", desc: "Ancient temples & culture", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop" },
    { name: "Pokhara", desc: "Gateway to Annapurna", img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=500&fit=crop" },
    { name: "Chitwan", desc: "Wildlife & Jungles", img: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&h=500&fit=crop" },
    { name: "Everest", desc: "The top of the world", img: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=400&h=500&fit=crop" }
  ];

  return (
    <div className="w-full bg-[#FCFDFE] selection:bg-teal-100 overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-[95vh] w-full flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 2 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000')`, filter: 'brightness(0.55)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#FCFDFE]" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white text-xs font-bold flex items-center gap-2">
              <FaCloudSun className="text-teal-400 text-lg" />
              <span>NEPAL: {weather.temp}°C, {weather.condition}</span>
            </div>
          </motion.div>

          <motion.h1 variants={fadeInUp} initial="hidden" animate="visible" className="text-white text-6xl md:text-8xl lg:text-9xl font-black mb-10 leading-[1.0] drop-shadow-2xl">
            Nepal <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-200 italic">Reimagined</span>
          </motion.h1>
          
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="relative max-w-3xl mx-auto flex items-center bg-white/10 backdrop-blur-2xl p-2 rounded-[2.5rem] border border-white/20 shadow-2xl transition-all hover:border-white/40">
            <FaSearch className="ml-6 text-white/60 text-xl" />
            <input
              type="text"
              className="bg-transparent outline-none flex-1 p-5 text-white placeholder:text-white/60 font-medium text-lg"
              placeholder="Where does your soul want to go?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => navigate(`/search?searchTerm=${search}`)}
              className="bg-teal-500 hover:bg-teal-600 text-white px-10 py-5 rounded-3xl font-black transition-all active:scale-95 shadow-lg shadow-teal-500/40"
            >
              Explore
            </button>
          </motion.div>
        </div>
      </section>

      {/* --- QUICK CATEGORIES --- */}
      <div className="max-w-6xl mx-auto -mt-12 relative z-20 px-4">
        <motion.div initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
          {[
            { label: 'Best Offers', icon: LuBadgePercent, color: 'text-rose-500', link: '/search?offer=true' },
            { label: 'Top Rated', icon: FaStar, color: 'text-amber-500', link: '/search?sort=packageRating' },
            { label: 'Latest', icon: FaCalendar, color: 'text-blue-500', link: '/search?sort=createdAt' },
            { label: 'Trending', icon: FaRankingStar, color: 'text-purple-500', link: '/search?sort=packageTotalRatings' }
          ].map((cat, idx) => (
            <button key={idx} onClick={() => navigate(cat.link)} className="flex items-center justify-center gap-3 py-10 px-4 font-bold text-slate-700 hover:bg-slate-50 transition-all border-r last:border-r-0 border-slate-100 group">
              <cat.icon className={`text-3xl ${cat.color} group-hover:scale-110 transition-transform`} />
              <span className="hidden sm:inline text-lg">{cat.label}</span>
            </button>
          ))}
        </motion.div>
      </div>

      {/* --- AI CONCIERGE (Floating) --- */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end">
        <AnimatePresence>
          {isAiOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-6 w-[360px] bg-white rounded-[3rem] shadow-3xl border border-slate-100 overflow-hidden flex flex-col"
            >
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center"><FaRobot className="text-white text-xl" /></div>
                  <div>
                    <h4 className="font-black text-xs tracking-widest uppercase">AI Concierge</h4>
                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /><span className="text-[10px] font-bold text-teal-400 uppercase tracking-tighter">Personalized Suggestion</span></div>
                  </div>
                </div>
                <button onClick={() => setIsAiOpen(false)} className="hover:rotate-90 transition-transform"><FaTimes /></button>
              </div>
              <div className="p-8 bg-slate-50/50 min-h-[150px]">
                <p className="text-slate-600 text-sm leading-relaxed">
                  {aiResponse || "Namaste! I can analyze the current season in Nepal to suggest your perfect luxury trek. Shall we begin?"}
                </p>
                {isTyping && <div className="flex gap-1 mt-4"><div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.2s]" /><div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.4s]" /></div>}
              </div>
              <div className="p-6 bg-white border-t border-slate-100">
                <button onClick={getSeasonalRecommendation} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-teal-600 transition-all">
                  <FaMagic /> Get Seasonal Recommendation
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAiOpen(!isAiOpen)} className="bg-slate-900 text-white w-20 h-20 rounded-[2.2rem] shadow-2xl flex items-center justify-center text-3xl border-4 border-white">
          {isAiOpen ? <FaTimes /> : <FaRobot className="text-teal-400" />}
        </motion.button>
      </div>
      
      {/* --- PACKAGE LISTINGS --- */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 space-y-32">
          {loading ? (
            <div className="text-center py-20 text-slate-400 font-bold animate-pulse text-xl uppercase tracking-widest">Curating Collections...</div>
          ) : (
            <>
              {(hasBookings ? recommendedPackages : topPackages).length > 0 && (
                <motion.div initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }}>
                  <div className="flex justify-between items-end mb-16">
                    <div>
                      <h2 className="text-teal-600 font-bold uppercase tracking-widest text-xs mb-3">Exclusively For You</h2>
                      <h3 className="text-5xl font-black text-slate-900">{hasBookings ? "Tailored Just For You" : "Most Desired Escapes"}</h3>
                    </div>
                    <button onClick={() => navigate('/search')} className="group flex items-center gap-3 font-black text-slate-900 hover:text-teal-600 transition-colors">
                      View All <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {(hasBookings ? recommendedPackages : topPackages).slice(0, 4).map((pkg, i) => (
                      <PackageCard key={i} packageData={pkg} />
                    ))}
                  </div>
                </motion.div>
              )}

              {latestPackages.length > 0 && (
                <motion.div initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }}>
                  <h3 className="text-4xl font-black text-slate-900 mb-16 tracking-tight">Newly Discovered Frontiers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {latestPackages.slice(0, 4).map((pkg, i) => (
                      <PackageCard key={i} packageData={pkg} />
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* --- HIRE A GUIDE SECTION --- */}
      <section className="py-32 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }} className="mb-20">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-teal-600 font-bold uppercase tracking-widest text-xs mb-3">Expert Companions</h2>
                <h3 className="text-5xl font-black text-slate-900">Hire Your Perfect Guide</h3>
              </div>
              <button 
                onClick={() => navigate('/request-guide')} 
                className="group flex items-center gap-3 font-black text-slate-900 hover:text-teal-600 transition-colors hidden md:flex"
              >
                View All Guides <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
            <p className="text-slate-600 text-lg max-w-2xl">Connect with experienced and certified guides who know every secret of the Himalayas. Your adventure, perfectly guided.</p>
          </motion.div>

          {guideLoading ? (
            <div className="text-center py-20 text-slate-400 font-bold animate-pulse text-lg uppercase tracking-widest">
              Loading Expert Guides...
            </div>
          ) : guides.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-600 text-lg mb-6">No guides available at the moment</p>
              <button 
                onClick={() => navigate('/request-guide')}
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-2xl font-bold transition-all"
              >
                Explore All Guides
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guides.map((guide, index) => {
                const bookingCount = guideBookings[guide.email] || 0;
                const isBooked = bookingCount > 0;

                return (
                  <motion.div
                    key={guide._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8 }}
                    className={`group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200 h-full flex flex-col ${
                      isBooked ? 'opacity-85' : ''
                    }`}
                  >
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900" />
                    
                    {/* Booking Badge */}
                    {isBooked && (
                      <div className="absolute top-6 right-6 z-20">
                        <div className="px-4 py-2 rounded-full text-xs font-bold bg-amber-400 text-slate-900 shadow-lg transform group-hover:scale-110 transition-transform">
                          {bookingCount} Booked
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="relative z-10 p-8 flex flex-col h-full">
                      {/* Header */}
                      <div className="mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-300 flex items-center justify-center text-white font-black text-2xl mb-4 shadow-lg">
                          {guide.fullName.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="text-3xl font-black text-white mb-2">{guide.fullName}</h3>
                        <div className="flex items-center gap-2 text-teal-300">
                          <FaBriefcase className="text-lg" />
                          <span className="font-bold">{guide.experience} years experience</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-4 flex-grow">
                        {/* Location */}
                        <div className="flex items-start gap-3">
                          <FaMapMarkerAlt className="text-teal-400 mt-1 flex-shrink-0 text-lg" />
                          <div>
                            <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest">Location</p>
                            <p className="text-white text-sm mt-1">{guide.address}</p>
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-start gap-3">
                          <FaPhone className="text-emerald-400 mt-1 flex-shrink-0 text-lg" />
                          <div>
                            <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest">Phone</p>
                            <a 
                              href={`tel:${guide.phone}`}
                              className="text-white text-sm mt-1 hover:text-teal-300 transition-colors font-semibold"
                            >
                              {guide.phone}
                            </a>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mt-6 pt-6 border-t border-slate-700">
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`w-3 h-3 rounded-full ${isBooked ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                            <span className={`text-sm font-bold uppercase tracking-widest ${isBooked ? 'text-amber-300' : 'text-emerald-300'}`}>
                              {isBooked ? 'Actively Booked' : 'Available Now'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => navigate('/request-guide')}
                        disabled={isBooked}
                        className={`w-full mt-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all transform ${
                          isBooked
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-teal-500 text-white hover:bg-teal-400 active:scale-95 shadow-lg shadow-teal-500/30'
                        }`}
                      >
                        {isBooked ? 'Currently Unavailable' : 'Hire Guide'}
                      </button>
                    </div>

                    {/* Decorative Element */}
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mb-16 group-hover:bg-teal-500/20 transition-all" />
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Mobile View All Button */}
          <div className="mt-12 text-center md:hidden">
            <button 
              onClick={() => navigate('/request-guide')}
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-2xl font-bold transition-all"
            >
              View All Guides
            </button>
          </div>
        </div>
      </section>

      {/* --- SIGNATURE JOURNEY --- */}
      <section className="py-32 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div initial="hidden" whileInView="visible" variants={fadeInUp} viewport={{ once: true }}>
            <h2 className="text-teal-600 font-bold uppercase tracking-[0.3em] text-sm mb-4">The Signature Journey</h2>
            <h3 className="text-5xl font-black text-slate-900 mb-10 leading-tight">A Glimpse into <br/> Himalayan Perfection</h3>
            <div className="space-y-12 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {[
                { title: "Arrival & High-End Welcome", time: "Day 1", desc: "Private transfer to your luxury boutique hotel with a sunset heritage tour." },
                { title: "Mountain Flight or Heli-Trek", time: "Day 2", desc: "Champagne breakfast overlooking Everest's summit before exploring hidden valleys." },
                { title: "Cultural Immersion", time: "Day 3", desc: "Private access to ancient monasteries and exclusive dinner at a Rana palace." }
              ].map((item, i) => (
                <div key={i} className="relative pl-12 group">
                  <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center z-10 group-hover:bg-teal-500 transition-colors">
                    <FaCheckCircle className="text-teal-500 group-hover:text-white text-sm" />
                  </div>
                  <span className="text-teal-600 font-black text-sm uppercase">{item.time}</span>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-[4rem] overflow-hidden h-[700px] shadow-3xl">
            {/* FIXED IMAGE PATH */}
            <img src="/images/helicopter view.jpg" className="w-full h-full object-cover" alt="Luxury Travel" />
          </motion.div>
        </div>
      </section>

      {/* --- NEWSLETTER "CLUB" (Glassmorphism) --- */}
      <section className="py-32 px-6">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto relative rounded-[4rem] overflow-hidden p-16 md:p-24 text-center bg-slate-900"
        >
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 blur-[120px] rounded-full -mr-40 -mt-40" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full -ml-40 -mb-40" />
          
          <div className="relative z-10">
            <div className="bg-white/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-10 backdrop-blur-xl border border-white/20 shadow-2xl">
              <FaEnvelope className="text-teal-400 text-3xl" />
            </div>
            <h2 className="text-white text-5xl md:text-6xl font-black mb-8 leading-tight">Join The <br/> Everest Circle</h2>
            <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Gain exclusive access to private luxury trekkings and seasonal openings before they reach the public.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 max-w-2xl mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 bg-white/5 border border-white/20 rounded-[1.5rem] px-8 py-5 text-white outline-none focus:border-teal-400 transition-colors text-lg"
              />
              <button className="bg-teal-500 text-white px-12 py-5 rounded-[1.5rem] font-black text-lg hover:bg-teal-400 transition-all active:scale-95 shadow-xl shadow-teal-500/30">
                Join Now
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-24">
            <div className="bg-teal-50 text-teal-600 p-4 rounded-3xl mb-8">
              <FaQuoteLeft className="text-3xl" />
            </div>
            <h3 className="text-5xl font-black text-slate-900 tracking-tight">Voices of the Wild</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {[
              { name: "Anjef Dangol", role: "Adventure Architect", text: "The attention to detail in these luxury treks is unmatched. Every camp felt like a boutique retreat amidst the peaks." },
              { name: "Sita Gurung", role: "Heritage Specialist", text: "Exclusive access to hidden temple rituals made my journey more than just a trip—it was a spiritual awakening." }
            ].map((t, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="p-12 rounded-[3.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-teal-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <p className="text-2xl text-slate-600 italic mb-10 font-medium leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-teal-500/20">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xl">{t.name}</h4>
                    <p className="text-sm text-teal-600 font-bold uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* --- FOOTER BANNER --- */}
      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale mb-12">
            <span className="font-black text-2xl tracking-[0.2em]">NEPAL TRAVEL</span>
            <span className="font-black text-2xl tracking-[0.2em]">HIMALAYAN LUXURY</span>
            <span className="font-black text-2xl tracking-[0.2em]">ELITE TREKS</span>
          </div>
          <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.5em]">
            © 2026 Explore Nepal • Redefining High-Altitude Hospitality
          </p>
        </div>
      </footer>
      
    </div>
  );
};

export default Home;