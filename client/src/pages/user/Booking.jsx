import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaClock, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaChevronDown, FaChevronUp, FaShieldAlt, FaStar } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

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
  });

  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [openSection, setOpenSection] = useState(0);

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

  const handleBookPackage = () => {
    if (!bookingData.date) {
      toast.error("Please select a travel date");
      return;
    }
    navigate("/stripe-checkout", {
      state: {
        bookingDetails: { ...bookingData, packageName: packageData.packageName, packageId: params?.packageId },
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
        totalPrice: price * prev.persons,
      }));
    }
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
        
        {/* BREADCRUMB / MINI HEADER */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-600 mb-6">
          <FaStar className="text-[10px]" />
          <span>Premium Travel Experience</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: 7/12 width */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* HERO IMAGE */}
            <div className="relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl group">
              <img
                src={packageData.packageImages?.[0] || DEFAULT_IMAGE}
                alt={packageData.packageName}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => (e.target.src = DEFAULT_IMAGE)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                  {packageData.packageName}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-white/90 font-medium">
                  <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                    <FaMapMarkerAlt className="text-teal-400" /> {packageData.packageDestination}
                  </span>
                  <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                    <FaClock className="text-teal-400" /> {packageData.packageDays}D / {packageData.packageNights}N
                  </span>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold mb-4">The Experience</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {packageData.packageDescription || "Discover an unparalleled journey through the world's most breathtaking landscapes. This curated package offers a blend of luxury, culture, and adventure designed for the modern traveler."}
              </p>
            </div>

            {/* ACCORDION */}
            <div className="space-y-4">
              {sections.map((sec, i) => (
                <div key={i} className={`bg-white rounded-2xl border transition-all duration-300 ${openSection === i ? 'border-teal-500 shadow-md' : 'border-slate-100 shadow-sm'}`}>
                  <button 
                    onClick={() => setOpenSection(openSection === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="text-lg font-bold text-slate-800">{sec.title}</span>
                    <div className={`p-2 rounded-full transition-colors ${openSection === i ? 'bg-teal-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                      {openSection === i ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </button>
                  {openSection === i && (
                    <div className="px-6 pb-6 text-slate-600 animate-fadeIn">
                      <div className="h-px bg-slate-100 mb-4" />
                      {sec.content || "Information regarding this section is currently being updated for the upcoming season."}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: 5/12 width (Sticky Sidebar) */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Price</p>
                  <h2 className="text-3xl font-black text-slate-900">
                    Rs {bookingData.totalPrice}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-teal-600">Per Person</p>
                  <p className="text-lg font-bold">Rs {pricePerPerson}</p>
                </div>
              </div>

              {/* INPUTS */}
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
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                    <FaUsers className="text-teal-500" /> Guest Count
                  </label>
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2 border-2 border-slate-50">
                    <button 
                      onClick={() => {
                        const p = Math.max(1, bookingData.persons - 1);
                        setBookingData({...bookingData, persons: p, totalPrice: p * pricePerPerson});
                      }}
                      className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm text-xl font-bold hover:text-teal-600 transition-colors"
                    >-</button>
                    <span className="text-lg font-black">{bookingData.persons}</span>
                    <button 
                      onClick={() => {
                        const p = Math.min(10, bookingData.persons + 1);
                        setBookingData({...bookingData, persons: p, totalPrice: p * pricePerPerson});
                      }}
                      className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm text-xl font-bold hover:text-teal-600 transition-colors"
                    >+</button>
                  </div>
                </div>
              </div>

              <div className="my-8 h-px bg-slate-100" />

              <button 
                onClick={handleBookPackage}
                disabled={!bookingData.date || loading}
                className="w-full bg-slate-900 text-white rounded-2xl py-5 font-bold text-lg hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-200 transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
              >
                {loading ? "Processing..." : "Confirm Booking"}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase">
                <FaShieldAlt className="text-teal-500 text-sm" />
                Secure Checkout & Instant Confirmation
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Booking;