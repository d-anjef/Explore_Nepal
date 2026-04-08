import React, { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { 
  FaClock, FaMapMarkerAlt, FaUsers, FaCalendarAlt, 
  FaChevronDown, FaChevronUp, FaShieldAlt, FaStar, 
  FaTimes, FaUserTie, FaCheckCircle, FaArrowLeft, FaBriefcase,
  FaInfoCircle
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop";

const Booking = () => {
  const { currentUser } = useSelector((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Date logic: Restrict past dates
  const today = new Date().toISOString().split("T")[0];

  const [booking, setBooking] = useState({
    persons: 1,
    date: "",
    selectedGuide: null,
    useStaffGuide: true,
  });

  const [openSection, setOpenSection] = useState(0);
  const [guides, setGuides] = useState([]);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // COMPUTED VALUES
  const pricePerPerson = useMemo(() => 
    packageData?.packageDiscountPrice || packageData?.packagePrice || 0
  , [packageData]);

  const guidePrice = useMemo(() => {
    if (booking.useStaffGuide || !packageData) return 0;
    return 5000 * (packageData.packageDays || 1);
  }, [booking.useStaffGuide, packageData]);

  const totalPrice = useMemo(() => 
    (pricePerPerson * booking.persons) + guidePrice
  , [pricePerPerson, booking.persons, guidePrice]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [pkgRes, guideRes] = await Promise.all([
        fetch(`/api/package/get-package-data/${params?.packageId}`),
        fetch("/api/guide-application/get-approved-guides?limit=10")
      ]);

      const pkgData = await pkgRes.json();
      const gData = await guideRes.json();

      if (pkgData?.success) setPackageData(pkgData.packageData);
      if (gData?.success) {
        setGuides((gData.guides || []).filter(g => g.email !== currentUser?.email));
      }
    } catch (err) {
      toast.error("Connectivity issue. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [params?.packageId, currentUser?.email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBookPackage = () => {
    if (!booking.date) return toast.error("Please select a travel date");
    if (booking.date < today) return toast.error("Travel date cannot be in the past");
    
    navigate("/stripe-checkout", {
      state: {
        bookingDetails: { 
          ...booking,
          totalPrice,
          packageId: params?.packageId,
          packageName: packageData.packageName,
          guideType: booking.useStaffGuide ? "Staff" : "Private Professional",
          guidePrice: guidePrice
        },
        packageData,
      },
    });
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-10 h-10 border-2 border-slate-100 border-t-black rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Experience</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pb-20 selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* NAV & STATUS */}
        <div className="flex justify-between items-center mb-12">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-all">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Return
          </button>
          <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-100 rounded-full shadow-sm text-[10px] font-black uppercase tracking-widest">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Direct Booking Available
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: GALLERY & INFO */}
          <div className="lg:col-span-7 space-y-12">
            <div className="relative aspect-video lg:aspect-[16/10] rounded-[3.5rem] overflow-hidden shadow-2xl group">
              <img src={packageData.packageImages?.[0] || DEFAULT_IMAGE} className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" alt="Destination" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-12 left-12 right-12">
                <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map(s => <FaStar key={s} className="text-yellow-400 text-[10px]" />)}
                    <span className="text-[10px] text-white/60 font-black uppercase tracking-widest ml-2">Verified Destination</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase">{packageData.packageName}</h1>
              </div>
            </div>

            {/* DETAILS ACCORDION */}
            <div className="space-y-4">
              {[
                { title: "Accommodation", icon: <FaShieldAlt />, content: packageData.packageAccommodation },
                { title: "Dining & Meals", icon: <FaStar />, content: packageData.packageMeals },
                { title: "Planned Activities", icon: <FaBriefcase />, content: packageData.packageActivities }
              ].map((sec, i) => (
                <div key={i} className={`bg-white rounded-[2rem] border transition-all duration-500 ${openSection === i ? 'border-black shadow-xl ring-4 ring-slate-50' : 'border-slate-100 hover:border-slate-200'}`}>
                  <button onClick={() => setOpenSection(openSection === i ? null : i)} className="w-full p-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className={`text-lg ${openSection === i ? 'text-black' : 'text-slate-300'}`}>{sec.icon}</span>
                        <span className="font-black uppercase tracking-[0.15em] text-[11px]">{sec.title}</span>
                    </div>
                    <div className={`p-2 rounded-xl transition-all ${openSection === i ? 'rotate-180 bg-black text-white' : 'bg-slate-50 text-slate-400'}`}>
                      <FaChevronDown />
                    </div>
                  </button>
                  <AnimatePresence>
                    {openSection === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-8 pb-8 text-slate-500 text-sm leading-relaxed border-t border-slate-50 pt-6">
                        {sec.content || "Experience details will be shared in your digital itinerary."}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: PREMIUM BOOKING CARD */}
          <div className="lg:col-span-5">
            <div className="sticky top-10 bg-white rounded-[3.5rem] p-10 lg:p-14 shadow-2xl shadow-slate-200/50 border border-slate-50">
              
              <div className="mb-12">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Total Investment</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tighter">Rs {totalPrice.toLocaleString()}</span>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">NPR</span>
                </div>
                <p className="mt-4 text-[11px] font-bold text-teal-600 bg-teal-50 inline-block px-3 py-1 rounded-md">
                    Value: Rs {pricePerPerson.toLocaleString()} / Guest
                </p>
              </div>

              <div className="space-y-10">
                {/* DATE SELECTOR - PAST DATES BLOCKED */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Departure Date</label>
                    {!booking.date && <span className="text-[9px] text-red-500 font-bold uppercase animate-pulse">Required</span>}
                  </div>
                  <div className="relative group">
                    <FaCalendarAlt className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-black transition-colors" />
                    <input 
                      type="date" 
                      min={today} // BLOCK PAST DATES
                      className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-black outline-none transition-all cursor-pointer"
                      onChange={(e) => setBooking({...booking, date: e.target.value})}
                    />
                  </div>
                </div>

                {/* GUEST SELECTOR */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Number of Guests</label>
                  <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-2 border border-slate-100">
                    <button onClick={() => setBooking(prev => ({ ...prev, persons: Math.max(1, prev.persons - 1) }))} className="w-14 h-14 bg-white rounded-xl shadow-sm text-xl font-black hover:bg-black hover:text-white transition-all active:scale-90">-</button>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black">{booking.persons}</span>
                        <span className="text-[8px] font-bold uppercase text-slate-400 tracking-tighter">Guests</span>
                    </div>
                    <button onClick={() => setBooking(prev => ({ ...prev, persons: Math.min(10, prev.persons + 1) }))} className="w-14 h-14 bg-white rounded-xl shadow-sm text-xl font-black hover:bg-black hover:text-white transition-all active:scale-90">+</button>
                  </div>
                </div>

                {/* GUIDING SERVICE */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Service Preference</label>
                    <div className="grid gap-4">
                        <button 
                            onClick={() => setBooking({...booking, useStaffGuide: true, selectedGuide: null})}
                            className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${booking.useStaffGuide ? 'border-black bg-slate-50' : 'border-slate-100'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${booking.useStaffGuide ? 'bg-black text-white' : 'bg-white text-slate-200'}`}><FaCheckCircle /></div>
                                <div className="text-left font-black uppercase text-[10px] tracking-widest">Local Expert Staff</div>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400">Included</span>
                        </button>

                        <button 
                            onClick={() => setShowGuideModal(true)}
                            className={`p-6 rounded-3xl border-2 border-dashed transition-all flex items-center justify-between ${booking.selectedGuide ? 'border-teal-500 bg-teal-50/20' : 'border-slate-200 hover:border-black'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${booking.selectedGuide ? 'bg-teal-500 text-white' : 'bg-white text-slate-200 shadow-sm'}`}><FaUserTie /></div>
                                <div className="text-left">
                                    <p className="font-black uppercase text-[10px] tracking-widest">{booking.selectedGuide?.fullName || "Private Professional"}</p>
                                    <p className="text-[9px] font-bold text-teal-600 mt-1 uppercase tracking-tighter">{booking.selectedGuide ? "Active" : "+ Rs 5,000 / Day"}</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black underline uppercase">Modify</span>
                        </button>
                    </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button 
                onClick={handleBookPackage}
                disabled={!booking.date}
                className="w-full mt-14 bg-black text-white rounded-[2rem] py-6 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 hover:shadow-2xl transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-[0.97]"
              >
                Secure This Package
              </button>

              <div className="mt-8 flex items-center justify-center gap-3 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                <FaShieldAlt className="text-teal-500" />
                Guaranteed Secure Booking
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: SELECT GUIDE */}
      <AnimatePresence>
        {showGuideModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6" onClick={() => setShowGuideModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-[4rem] max-w-lg w-full overflow-hidden shadow-2xl">
              <div className="p-12 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Private Experts</h3>
                <button onClick={() => setShowGuideModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-black hover:text-white transition-all"><FaTimes /></button>
              </div>
              <div className="p-10 max-h-[40vh] overflow-y-auto space-y-6">
                {guides.map(guide => (
                  <div key={guide._id} onClick={() => { setBooking({...booking, selectedGuide: guide, useStaffGuide: false}); setShowGuideModal(false); toast.success(`Guide Assigned: ${guide.fullName}`); }} className="group p-6 rounded-[2.5rem] bg-slate-50 hover:bg-black transition-all cursor-pointer flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center font-black text-xl group-hover:bg-white/10 group-hover:text-white transition-all shadow-sm">{guide.fullName.charAt(0)}</div>
                    <div className="flex-1">
                      <h4 className="font-black text-xs uppercase tracking-widest group-hover:text-white transition-all">{guide.fullName}</h4>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter group-hover:text-white/60 transition-all">{guide.experience} Year Professional</p>
                    </div>
                    <div className="text-[8px] font-black uppercase bg-white px-4 py-2 rounded-full border border-slate-100 group-hover:border-white/20">Assign</div>
                  </div>
                ))}
              </div>
              <div className="p-10 bg-slate-50">
                <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest mb-6 px-10">Private guides are subject to availability and verified status.</p>
                <button onClick={() => { setBooking({...booking, useStaffGuide: true, selectedGuide: null}); setShowGuideModal(false); }} className="w-full py-5 bg-white border border-slate-200 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:border-black transition-all">
                  Use Local Staff Instead
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Booking;