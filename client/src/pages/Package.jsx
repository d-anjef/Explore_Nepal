import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/bundle";
import {
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
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
import "./styles/Package.css";

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
        setPackageData({
          packageName: data?.packageData?.packageName,
          packageDescription: data?.packageData?.packageDescription,
          packageDestination: data?.packageData?.packageDestination,
          packageCategory: data?.packageData?.packageCategory,
          packageDays: data?.packageData?.packageDays,
          packageNights: data?.packageData?.packageNights,
          packageAccommodation: data?.packageData?.packageAccommodation,
          packageMeals: data?.packageData?.packageMeals,
          packageActivities: data?.packageData?.packageActivities,
          packagePrice: data?.packageData?.packagePrice,
          packageDiscountPrice: data?.packageData?.packageDiscountPrice,
          packageOffer: data?.packageData?.packageOffer,
          packageRating: data?.packageData?.packageRating,
          packageTotalRatings: data?.packageData?.packageTotalRatings,
          packageImages: data?.packageData?.packageImages,
        });
        setLoading(false);
      } else {
        setError(data?.message || "Something went wrong!");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError("Failed to load package details");
    }
  };

  const giveRating = async () => {
    checkRatingGiven();
    if (ratingGiven) {
      toast.error("You already submitted your rating!");
      return;
    }
    if (ratingsData.rating === 0 && ratingsData.review === "") {
      toast.error("At least 1 field is required!");
      return;
    }
    if (!ratingsData.userRef) {
      toast.error("Please log in to submit a rating!");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/rating/give-rating", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ratingsData),
      });
      const data = await res.json();
      if (data?.success) {
        setLoading(false);
        toast.success(data?.message || "Rating submitted successfully!");
        setRatingsData({ ...ratingsData, rating: 0, review: "" });
        getPackageData();
        getRatings();
        checkRatingGiven();
      } else {
        setLoading(false);
        toast.error(data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Failed to submit rating");
    }
  };

  const getRatings = async () => {
    try {
      const res = await fetch(`/api/rating/get-ratings/${params.id}/4`);
      const data = await res.json();
      if (data && data.length > 0) {
        setPackageRatings(data);
      } else {
        setPackageRatings([]);
      }
    } catch (error) {
      console.log(error);
      setPackageRatings([]);
    }
  };

  const checkRatingGiven = async () => {
    try {
      const res = await fetch(
        `/api/rating/rating-given/${currentUser?._id}/${params?.id}`
      );
      const data = await res.json();
      setRatingGiven(data?.given || false);
    } catch (error) {
      console.log(error);
      setRatingGiven(false);
    }
  };

  const checkIfBooked = async () => {
    if (!currentUser?._id) return;
    try {
      const res = await fetch(
        `/api/booking/check-booking/${currentUser._id}/${params?.id}`
      );
      const data = await res.json();
      setHasBooked(data?.hasBooked || false);
    } catch (error) {
      console.log(error);
      setHasBooked(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      getPackageData();
      getRatings();
    }
    if (currentUser) {
      checkRatingGiven();
      checkIfBooked();
    }
  }, [params.id, currentUser]);

  const discountPercentage =
    packageData?.packageOffer && packageData?.packageDiscountPrice
      ? Math.floor(
          ((packageData?.packagePrice - packageData?.packageDiscountPrice) /
            packageData?.packagePrice) *
            100
        )
      : 0;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300 font-medium">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col w-full items-center justify-center min-h-screen gap-4">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-700 dark:text-red-100 font-semibold">Something went wrong!</p>
          <p className="text-red-600 dark:text-red-200 text-sm mt-2">{error}</p>
        </div>
        <Link
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-colors"
          to="/home"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 min-h-screen">
      {/* Header Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-semibold uppercase text-sm tracking-wide transition-colors"
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
            className="flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold uppercase text-sm tracking-wide transition-colors"
            title="Share this package"
          >
            <FaShare size={14} />
            Share
          </button>
        </div>
      </div>

      {/* Copy Notification */}
      {copied && (
        <div className="fixed top-20 right-4 z-50 rounded-lg bg-green-500 text-white p-4 shadow-lg animate-pulse font-medium">
          ✓ Link copied!
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* LEFT COLUMN - LARGE IMAGE */}
          <div className="flex items-start justify-center order-2 lg:order-1">
            <div className="w-full max-w-md bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden" style={{ aspectRatio: "1/1" }}>
              <Swiper
                navigation
                pagination={{ clickable: true }}
                className="h-full w-full"
              >
                {packageData?.packageImages?.length > 0 ? (
                  packageData.packageImages.map((imageUrl, i) => (
                    <SwiperSlide key={i} className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                      <img
                        src={imageUrl}
                        alt={`${packageData?.packageName} - image ${i + 1}`}
                        className="h-full w-full object-contain p-4"
                      />
                    </SwiperSlide>
                  ))
                ) : (
                  <SwiperSlide className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                    <img
                      src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=600&fit=crop"
                      alt="Placeholder"
                      className="h-full w-full object-contain p-4"
                    />
                  </SwiperSlide>
                )}
              </Swiper>
            </div>
          </div>

          {/* RIGHT COLUMN - PACKAGE DETAILS */}
          <div className="flex flex-col justify-start order-1 lg:order-2 space-y-6">
            
            {/* Category/Breadcrumb */}
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {packageData?.packageCategory || "Travel Package"}
            </p>

            {/* Package Name */}
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              {packageData?.packageName}
            </h1>

            {/* Price Section */}
            <div className="space-y-3">
              <p className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                {packageData?.packageOffer && packageData?.packageDiscountPrice ? (
                  <>
                    <span className="line-through text-slate-400 dark:text-slate-600 text-2xl mr-3">
                      Rs {packageData?.packagePrice?.toLocaleString("en-IN")}
                    </span>
                    Rs {packageData?.packageDiscountPrice?.toLocaleString("en-IN")}
                  </>
                ) : (
                  `Rs ${packageData?.packagePrice?.toLocaleString("en-IN")}`
                )}
              </p>
              {discountPercentage > 0 && (
                <p className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                  {discountPercentage}% Discount
                </p>
              )}
            </div>

            {/* Destination & Quick Info */}
            <div className="space-y-2 border-y border-slate-200 dark:border-slate-700 py-4">
              <p className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
                <FaMapMarkerAlt size={14} className="text-teal-600" />
                {packageData?.packageDestination}
              </p>

              {(+packageData?.packageDays > 0 || +packageData?.packageNights > 0) && (
                <p className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
                  <FaClock size={14} className="text-blue-600" />
                  {+packageData?.packageDays > 0 && `${packageData?.packageDays} ${+packageData?.packageDays > 1 ? "Days" : "Day"}`}
                  {+packageData?.packageDays > 0 && +packageData?.packageNights > 0 && " • "}
                  {+packageData?.packageNights > 0 && `${packageData?.packageNights} ${+packageData?.packageNights > 1 ? "Nights" : "Night"}`}
                </p>
              )}

              {packageData?.packageTotalRatings > 0 && (
                <div className="flex items-center gap-2 pt-2">
                  <Rating
                    value={packageData?.packageRating || 0}
                    readOnly
                    precision={0.1}
                    size="small"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    ({packageData?.packageTotalRatings})
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                {descExpanded
                  ? packageData?.packageDescription
                  : packageData?.packageDescription?.length > 150
                  ? packageData?.packageDescription.substring(0, 150) + "..."
                  : packageData?.packageDescription}
              </p>
              {packageData?.packageDescription?.length > 150 && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="mt-3 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold text-sm flex items-center gap-2"
                >
                  {descExpanded ? (
                    <>
                      Show Less <FaChevronUp size={12} />
                    </>
                  ) : (
                    <>
                      Show More <FaChevronDown size={12} />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Book Button */}
            {currentUser?.user_role !== 1 && (
              <button
                type="button"
                onClick={() => {
                  if (currentUser) {
                    navigate(`/booking/${params?.id}`);
                  } else {
                    navigate("/login");
                  }
                }}
                className="w-full bg-black dark:bg-slate-950 text-white font-bold py-4 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-800 transition-all text-base uppercase tracking-widest"
              >
                Book Now
              </button>
            )}

            {/* Verification Badges */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                <FaCheck size={14} className="text-green-600" />
                Verified Package
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                <FaCheck size={14} className="text-green-600" />
                1:1 Service Ratio
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                <FaCheck size={14} className="text-green-600" />
                Priority Support
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Accommodation */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <button
              onClick={() => toggleSection("accommodation")}
              className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-6 py-4 flex items-center justify-between font-semibold text-slate-900 dark:text-white transition-colors"
            >
              <span className="flex items-center gap-3">
                <FaHotel className="text-teal-600 text-lg" />
                Accommodation
              </span>
              <FaChevronDown
                size={16}
                className={`transition-transform ${
                  expandedSection === "accommodation" ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSection === "accommodation" && (
              <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                  {packageData?.packageAccommodation || "No accommodation details available"}
                </p>
              </div>
            )}
          </div>

          {/* Activities */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <button
              onClick={() => toggleSection("activities")}
              className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-6 py-4 flex items-center justify-between font-semibold text-slate-900 dark:text-white transition-colors"
            >
              <span className="flex items-center gap-3">
                <FaRunning className="text-blue-600 text-lg" />
                Activities
              </span>
              <FaChevronDown
                size={16}
                className={`transition-transform ${
                  expandedSection === "activities" ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSection === "activities" && (
              <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                  {packageData?.packageActivities || "No activities listed"}
                </p>
              </div>
            )}
          </div>

          {/* Meals */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <button
              onClick={() => toggleSection("meals")}
              className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-6 py-4 flex items-center justify-between font-semibold text-slate-900 dark:text-white transition-colors"
            >
              <span className="flex items-center gap-3">
                <FaUtensils className="text-orange-600 text-lg" />
                Meals
              </span>
              <FaChevronDown
                size={16}
                className={`transition-transform ${
                  expandedSection === "meals" ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSection === "meals" && (
              <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                  {packageData?.packageMeals || "No meal information available"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ratings & Reviews Section */}
      <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
            Ratings & Reviews
          </h2>

          {packageRatings && (
            <>
              {/* Rating Input Form */}
              {currentUser && !ratingGiven && hasBooked && (
                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-8 mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Share your experience
                  </h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">Your Rating:</span>
                      <Rating
                        value={ratingsData?.rating}
                        onChange={(e, newValue) => {
                          setRatingsData({
                            ...ratingsData,
                            rating: newValue,
                          });
                        }}
                      />
                    </div>
                    <textarea
                      className="w-full resize-none p-4 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-900 dark:text-white"
                      rows={4}
                      placeholder="Share your experience with this package..."
                      value={ratingsData?.review}
                      onChange={(e) => {
                        setRatingsData({
                          ...ratingsData,
                          review: e.target.value,
                        });
                      }}
                    ></textarea>
                    <button
                      disabled={
                        (ratingsData.rating === 0 && ratingsData.review === "") ||
                        loading
                      }
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        giveRating();
                      }}
                      className="w-full bg-black dark:bg-slate-950 text-white font-bold py-3 rounded-lg disabled:opacity-50 hover:bg-slate-800 dark:hover:bg-slate-800 transition-all uppercase tracking-wide"
                    >
                      {loading ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </div>
              )}

              {/* Ratings Display Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <RatingCard packageRatings={packageRatings} />
              </div>

              {packageData?.packageTotalRatings > 4 && (
                <div className="flex justify-center">
                  <button
                    onClick={() => navigate(`/package/ratings/${params?.id}`)}
                    className="flex items-center justify-center gap-2 px-8 py-3 border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white rounded-lg font-bold hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all uppercase tracking-wide"
                  >
                    View All <FaArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* Login Prompt */}
              {!currentUser && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center">
                  <p className="text-slate-900 dark:text-white font-semibold mb-4">
                    Log in to rate this package
                  </p>
                  <button
                    onClick={() => {
                      navigate("/login");
                    }}
                    className="bg-black dark:bg-slate-950 text-white font-bold px-8 py-3 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-800 transition-all"
                  >
                    Log In
                  </button>
                </div>
              )}

              {/* Booking Required Message */}
              {currentUser && !hasBooked && !ratingGiven && (
                <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center">
                  <p className="text-yellow-900 dark:text-yellow-100 font-medium">
                    You need to book this package before you can rate it.
                  </p>
                </div>
              )}

              {/* Already Rated Message */}
              {currentUser && ratingGiven && (
                <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-6 text-center">
                  <p className="text-green-900 dark:text-green-100 font-semibold">
                    ✓ Thank you for rating this package!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Package;