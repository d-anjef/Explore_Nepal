import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { 
  FaClock, FaMapMarkerAlt, FaUsers, FaCalendarAlt, 
  FaChevronDown, FaChevronUp, FaShieldAlt, FaStar, 
  FaPhone, FaBriefcase, FaTimes, FaUserTie, FaCheckCircle,
  FaArrowLeft // Added for Back Button
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop";

const Booking = () => {
  const { currentUser } = useSelector((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();

  const [packageData, setPackageData] = useState({});
  const [bookingData, setBookingData] = useState({
    totalPrice: 0,
    packageDetails: null,
    buyer: null,
    persons: 1,
    date: "",
    selectedGuide: null,
    guidePrice: 0,
    useStaffGuide: true,
  });

  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [openSection, setOpenSection] = useState(0);
  
  const [guides, setGuides] = useState([]);
  const [guideLoading, setGuideLoading] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const getPackageData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/package/get-package-data/${params?.packageId}`);
      const data = await res.json();
      if (data?.success) {
        setPackageData(data.packageData);
      } else {
        toast.error(data?.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFeaturedGuides = async () => {
    try {
      setGuideLoading(true);
      const res = await fetch("/api/guide-application/get-approved-guides?limit=10");
      const data = await res.json();
      if (data.success) {
        const filteredGuides = (data.guides || []).filter(
          (guide) => guide && guide.email && guide.email !== currentUser?.email
        );
        setGuides(filteredGuides);
      }
    } catch (error) {
      console.error("Error fetching guides:", error);
    } finally {
      setGuideLoading(false);
    }
  };

  const handleSelectGuide = (guide) => {
    const guidePrice = 5000 * (packageData.packageDays || 1);
    setBookingData((prev) => ({
      ...prev,
      selectedGuide: guide,
      guidePrice: guidePrice,
      useStaffGuide: false,
      totalPrice: (pricePerPerson * prev.persons) + guidePrice,
    }));
    setShowGuideModal(false);
    toast.success(`Professional Guide ${guide.fullName} added!`);
  };

  const handleUseStaff = () => {
    setBookingData((prev) => ({
      ...prev,
      selectedGuide: null,
      guidePrice: 0,
      useStaffGuide: true,
      totalPrice: pricePerPerson * prev.persons,
    }));
    toast.success("Using Local Staff/Guide services");
  };

  const handleBookPackage = () => {
    if (!bookingData.date) {
      toast.error("Please select a travel date");
      return;
    }
    navigate("/stripe-checkout", {
      state: {
        bookingDetails: { 
          ...bookingData, 
          packageName: packageData.packageName, 
          packageId: params?.packageId,
          guideType: bookingData.useStaffGuide ? "Staff Guide" : "Private Guide",
        },
        packageData,
      },
    });
  };

  useEffect(() => {
    if (params?.packageId) getPackageData();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCurrentDate(tomorrow.toISOString().split("T")[0]);
  }, [params?.packageId]);

  useEffect(() => {
    if (packageData) {
      const price = packageData.packageDiscountPrice || packageData.packagePrice || 0;
      setBookingData((prev) => ({
        ...prev,
        packageDetails: params.packageId,
        buyer: currentUser?._id,
        totalPrice: (price * prev.persons) + (prev.guidePrice || 0),
      }));
    }
    getFeaturedGuides();
  }, [packageData, currentUser]);

  const pricePerPerson = packageData.packageDiscountPrice || packageData.packagePrice || 0;
  const sections = [
    { title: "Accommodation", content: packageData.packageAccommodation },
    { title: "Meals", content: packageData.packageMeals },
    { title: "Activities", content: packageData.packageActivities },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        
        {/* BACK BUTTON & HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-black transition-colors w-fit"
            >
              <FaArrowLeft size={12} />
              Back
            </button>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-600">
              <FaStar className="text-[10px]" />
              <span>Premium Travel Experience</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-8">
            <div className="relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl group">
              <img
                src={packageData.packageImages?.[0] || DEFAULT_IMAGE}
                alt={packageData.packageName}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => (e.target.src = DEFAULT_IMAGE)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">{packageData.packageName}</h1>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-teal-400" /> {packageData.packageDestination}
                  </span>
                  <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                    <FaClock className="text-teal-400" /> {packageData.packageDays}D / {packageData.packageNights}N
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold mb-4">The Experience</h2>
              <p className="text-slate-600 leading-relaxed text-lg">{packageData.packageDescription}</p>
            </div>

            <div className="space-y-4">
              {sections.map((sec, i) => (
                <div key={i} className={`bg-white rounded-2xl border transition-all ${openSection === i ? 'border-teal-500 shadow-md' : 'border-slate-100'}`}>
                  <button onClick={() => setOpenSection(openSection === i ? null : i)} className="w-full flex items-center justify-between p-6">
                    <span className="text-lg font-bold">{sec.title}</span>
                    <div className={`p-2 rounded-full ${openSection === i ? 'bg-teal-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                      {openSection === i ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </button>
                  {openSection === i && <div className="px-6 pb-6 text-slate-600 border-t border-slate-50 pt-4">{sec.content}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN (Sidebar) */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Price</p>
                  <h2 className="text-3xl font-black text-slate-900">Rs {bookingData.totalPrice}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-teal-600">Per Person</p>
                  <p className="text-lg font-bold">Rs {pricePerPerson}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                    <FaCalendarAlt className="text-teal-500" /> Travel Date
                  </label>
                  <input
                    type="date"
                    min={currentDate}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-xl p-4 transition-all outline-none font-medium"
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                    <FaUserTie className="text-teal-500" /> Guiding Service
                  </label>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={handleUseStaff}
                      className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${bookingData.useStaffGuide ? 'border-teal-500 bg-teal-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${bookingData.useStaffGuide ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <FaCheckCircle />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-800">Local Staff Guide</p>
                          <p className="text-xs text-slate-500">Included in package</p>
                        </div>
                      </div>
                    </button>

                    {bookingData.selectedGuide ? (
                      <div className="p-4 rounded-2xl border-2 border-teal-500 bg-teal-50/50 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
                                {bookingData.selectedGuide.fullName.charAt(0)}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-slate-800">{bookingData.selectedGuide.fullName}</p>
                                <p className="text-xs text-teal-600 font-bold">+ Rs {bookingData.guidePrice} (Professional)</p>
                            </div>
                         </div>
                         <button onClick={() => setShowGuideModal(true)} className="text-xs font-bold text-teal-600 underline">Change</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowGuideModal(true)}
                        className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-between ${!bookingData.useStaffGuide ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 hover:border-teal-200'}`}
                      >
                        <div className="flex items-center gap-3 text-slate-500">
                          <FaBriefcase />
                          <p className="text-sm font-bold">Private Expert Guide</p>
                        </div>
                        <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">+Rs 5k/day</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                    <FaUsers className="text-teal-500" /> Guest Count
                  </label>
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <button onClick={() => {
                        const p = Math.max(1, bookingData.persons - 1);
                        setBookingData({...bookingData, persons: p, totalPrice: (p * pricePerPerson) + bookingData.guidePrice});
                    }} className="w-10 h-10 bg-white rounded-lg shadow-sm font-bold">-</button>
                    <span className="font-black text-lg">{bookingData.persons}</span>
                    <button onClick={() => {
                        const p = Math.min(10, bookingData.persons + 1);
                        setBookingData({...bookingData, persons: p, totalPrice: (p * pricePerPerson) + bookingData.guidePrice});
                    }} className="w-10 h-10 bg-white rounded-lg shadow-sm font-bold">+</button>
                  </div>
                </div>
              </div>

              <div className="my-8 h-px bg-slate-100" />

              <button 
                onClick={handleBookPackage}
                disabled={!bookingData.date || loading}
                className="w-full bg-slate-900 text-white rounded-2xl py-5 font-bold text-lg hover:bg-teal-600 hover:shadow-lg transition-all disabled:opacity-30 active:scale-95"
              >
                {loading ? "Processing..." : "Confirm Booking"}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                <FaShieldAlt className="text-teal-500" />
                Secure Checkout & Instant Confirmation
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showGuideModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowGuideModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[2rem] max-w-xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-8 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold">Select Expert Guide</h2>
                <button onClick={() => setShowGuideModal(false)} className="text-slate-400 hover:text-slate-900"><FaTimes size={24} /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-4">
                {guides.map((guide) => (
                  <div key={guide._id} onClick={() => handleSelectGuide(guide)} className="bg-white p-5 rounded-2xl border-2 border-transparent hover:border-teal-500 cursor-pointer transition-all flex items-center gap-4 shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-black text-xl">{guide.fullName.charAt(0)}</div>
                    <div className="flex-1">
                      <h4 className="font-bold">{guide.fullName}</h4>
                      <p className="text-slate-500 text-sm">{guide.experience} years • Rs 5000/day</p>
                    </div>
                    <div className="text-teal-600 font-bold text-sm">Select</div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t bg-white">
                <button onClick={handleUseStaff} className="w-full py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all">
                  Skip & Use Local Staff Guide
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