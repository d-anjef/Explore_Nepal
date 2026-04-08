import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/bundle";
import {
  FaArrowLeft,
  FaArrowRight,
  FaClock,
  FaMapMarkerAlt,
  FaShare,
  FaChevronDown,
  FaChevronUp,
  FaHotel,
  FaRunning,
  FaUtensils,
  FaCheck,
} from "react-icons/fa";
import Rating from "@mui/material/Rating";
import { useSelector } from "react-redux";
import RatingCard from "./RatingCard";

const Package = () => {
  SwiperCore.use([Navigation, Pagination]);
  const { currentUser } = useSelector((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();

  const [packageData, setPackageData] = useState({
    packageName: "",
    packageDescription: "",
    packageDestination: "",
    packageCategory: "",
    packageDays: 1,
    packageNights: 1,
    packageAccommodation: "",
    packageMeals: "",
    packageActivities: "",
    packagePrice: 500,
    packageDiscountPrice: 0,
    packageOffer: false,
    packageRating: 0,
    packageTotalRatings: 0,
    packageImages: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ratingsData, setRatingsData] = useState({
    rating: 0,
    review: "",
    packageId: params?.id,
    userRef: currentUser?._id,
    username: currentUser?.username,
    userProfileImg: currentUser?.avatar,
  });
  const [packageRatings, setPackageRatings] = useState([]);
  const [ratingGiven, setRatingGiven] = useState(false);
  const [hasBooked, setHasBooked] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);

  const getPackageData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/package/get-package-data/${params?.id}`);
      const data = await res.json();
      if (data?.success) {
        setPackageData(data?.packageData);
        setLoading(false);
      } else {
        setError(data?.message || "Something went wrong!");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      setError("Failed to load package details");
    }
  };

  const getRatings = async () => {
    try {
      const res = await fetch(`/api/rating/get-ratings/${params.id}/4`);
      const data = await res.json();
      setPackageRatings(data && data.length > 0 ? data : []);
    } catch (error) {
      setPackageRatings([]);
    }
  };

  useEffect(() => {
    if (params.id) {
      getPackageData();
      getRatings();
    }
  }, [params.id, currentUser]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen text-black">
      {/* Header Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-black hover:opacity-70 font-bold uppercase text-sm tracking-wide transition-opacity"
          >
            <FaArrowLeft size={14} />
            Back To Home
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-2 text-black hover:opacity-70 font-bold uppercase text-sm tracking-wide transition-opacity"
          >
            <FaShare size={14} />
            Share
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* LEFT COLUMN - IMAGE */}
          <div className="flex items-start justify-center">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg overflow-hidden" style={{ aspectRatio: "1/1" }}>
              <Swiper navigation pagination={{ clickable: true }} className="h-full w-full">
                {packageData?.packageImages?.length > 0 ? (
                  packageData.packageImages.map((imageUrl, i) => (
                    <SwiperSlide key={i} className="h-full flex items-center justify-center bg-white">
                      <img src={imageUrl} alt="Package" className="h-full w-full object-contain p-4" />
                    </SwiperSlide>
                  ))
                ) : (
                  <SwiperSlide className="h-full flex items-center justify-center bg-white">
                    <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600" alt="Placeholder" className="h-full w-full object-contain p-4" />
                  </SwiperSlide>
                )}
              </Swiper>
            </div>
          </div>

          {/* RIGHT COLUMN - DETAILS */}
          <div className="flex flex-col justify-start space-y-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {packageData?.packageCategory || "Travel Package"}
            </p>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-black leading-tight">
              {packageData?.packageName}
            </h1>

            <div className="space-y-1">
              <p className="text-4xl font-black text-black">
                {packageData?.packageOffer && packageData?.packageDiscountPrice ? (
                  <>
                    <span className="line-through text-slate-300 text-2xl mr-3 font-normal">
                      Rs {packageData?.packagePrice?.toLocaleString("en-IN")}
                    </span>
                    Rs {packageData?.packageDiscountPrice?.toLocaleString("en-IN")}
                  </>
                ) : (
                  `Rs ${packageData?.packagePrice?.toLocaleString("en-IN")}`
                )}
              </p>
            </div>

            <div className="space-y-3 border-y border-slate-200 py-6">
              <p className="text-black font-semibold flex items-center gap-3">
                <FaMapMarkerAlt size={16} />
                {packageData?.packageDestination}
              </p>
              <p className="text-black font-semibold flex items-center gap-3">
                <FaClock size={16} />
                {packageData?.packageDays} Days • {packageData?.packageNights} Nights
              </p>
            </div>

            <p className="text-black leading-relaxed text-lg">
              {descExpanded ? packageData?.packageDescription : `${packageData?.packageDescription?.substring(0, 150)}...`}
            </p>

            <button
              onClick={() => navigate(currentUser ? `/booking/${params?.id}` : "/login")}
              className="w-full bg-black text-white font-black py-5 rounded-none hover:bg-slate-800 transition-all text-base uppercase tracking-[0.2em]"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Accordion Sections - Adjusted to White/Light Slate */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["accommodation", "activities", "meals"].map((section) => (
            <div key={section} className="border border-slate-200 rounded-none overflow-hidden">
              <button
                onClick={() => toggleSection(section)}
                className="w-full bg-white hover:bg-slate-50 px-6 py-5 flex items-center justify-between font-bold text-black uppercase text-sm tracking-wider transition-colors"
              >
                <span className="flex items-center gap-3">
                  {section === "accommodation" && <FaHotel />}
                  {section === "activities" && <FaRunning />}
                  {section === "meals" && <FaUtensils />}
                  {section}
                </span>
                <FaChevronDown className={`transition-transform ${expandedSection === section ? "rotate-180" : ""}`} />
              </button>
              {expandedSection === section && (
                <div className="px-6 py-4 bg-white border-t border-slate-100 text-black text-sm leading-relaxed">
                  {packageData[`package${section.charAt(0).toUpperCase() + section.slice(1)}`] || `No ${section} details.`}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Package;