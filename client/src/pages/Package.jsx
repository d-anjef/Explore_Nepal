import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import {
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
  FaClock,
  FaMapMarkerAlt,
  FaShare,
} from "react-icons/fa";
import Rating from "@mui/material/Rating";
import { useSelector } from "react-redux";
import RatingCard from "./RatingCard";
import "./styles/Package.css";

const Package = () => {
  SwiperCore.use([Navigation]);
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

  return (
    <div className="w-full">
      {loading && (
        <p className="text-center font-semibold" id="loading">
          Loading...
        </p>
      )}
      {error && (
        <div className="flex flex-col w-full items-center gap-2">
          <p className="text-center text-red-700">Something went wrong!</p>
          <Link
            className="bg-slate-600 text-white p-3 py-2 rounded-lg w-min"
            to="/home"
          >
            Back
          </Link>
        </div>
      )}
      {packageData && !loading && !error && (
        <div className="w-full">
          {/* Image Slider */}
          <Swiper navigation>
            {packageData?.packageImages?.length > 0 ? (
              packageData.packageImages.map((imageUrl, i) => (
                <SwiperSlide key={i}>
                  <div
                    style={{
                      background: `url(${imageUrl}) center no-repeat`,
                      backgroundSize: "cover",
                    }}
                  ></div>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                  }}
                ></div>
              </SwiperSlide>
            )}
          </Swiper>

          {/* Share Button */}
          <div
            className="absolute top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 2000);
            }}
            title="Share this package"
          >
            <FaShare className="text-slate-500" />
          </div>

          {/* Copy Notification */}
          {copied && (
            <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2">
              Link copied!
            </p>
          )}

          {/* Back Button */}
          <div
            className="absolute top-[13%] left-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer"
            onClick={() => {
              navigate("/home");
            }}
            title="Go back"
          >
            <FaArrowLeft className="text-slate-500" />
          </div>

          {/* Main Content */}
          <div className="w-full flex flex-col p-5 gap-2">
            {/* Package Name */}
            <p className="text-2xl font-bold capitalize">
              {packageData?.packageName}
            </p>

            {/* Price Section */}
            <p className="flex gap-1 text-2xl font-semibold my-3">
              {packageData?.packageOffer && packageData?.packageDiscountPrice ? (
                <>
                  <span className="line-through text-gray-700">
                    Rs {packageData?.packagePrice?.toLocaleString("en-IN")}
                  </span>
                  <span>Rs {packageData?.packageDiscountPrice?.toLocaleString("en-IN")}</span>
                  <span className="text-lg ml-2 bg-green-700 p-1 rounded text-white">
                    {discountPercentage}% Off
                  </span>
                </>
              ) : (
                <span>Rs {packageData?.packagePrice?.toLocaleString("en-IN")}</span>
              )}
            </p>

            {/* Destination */}
            <p className="text-green-700 flex items-center gap-1 text-lg capitalize">
              <FaMapMarkerAlt />
              {packageData?.packageDestination}
            </p>

            {/* Category */}
            {packageData?.packageCategory && (
              <p className="text-blue-600 font-medium text-lg capitalize">
                Category: {packageData?.packageCategory}
              </p>
            )}

            {/* Duration */}
            {(+packageData?.packageDays > 0 || +packageData?.packageNights > 0) && (
              <p className="flex items-center gap-2">
                <FaClock />
                {+packageData?.packageDays > 0 &&
                  (+packageData?.packageDays > 1
                    ? `${packageData?.packageDays} Days`
                    : `${packageData?.packageDays} Day`)}
                {+packageData?.packageDays > 0 && +packageData?.packageNights > 0 && " - "}
                {+packageData?.packageNights > 0 &&
                  (+packageData?.packageNights > 1
                    ? `${packageData?.packageNights} Nights`
                    : `${packageData?.packageNights} Night`)}
              </p>
            )}

            {/* Rating Display */}
            {packageData?.packageTotalRatings > 0 && (
              <div className="flex">
                <Rating
                  value={packageData?.packageRating || 0}
                  readOnly
                  precision={0.1}
                />
                <p>({packageData?.packageTotalRatings})</p>
              </div>
            )}

            {/* Description */}
            <div className="w-full flex flex-col mt-2">
              <p className="break-all flex flex-col font-medium">
                {packageData?.packageDescription?.length > 150 ? (
                  <>
                    <span id="desc">
                      {packageData?.packageDescription.substring(0, 150)}...
                    </span>
                    <button
                      id="moreBtn"
                      onClick={() => {
                        const descEl = document.getElementById("desc");
                        const moreBtnEl = document.getElementById("moreBtn");
                        const lessBtnEl = document.getElementById("lessBtn");
                        if (descEl && moreBtnEl && lessBtnEl) {
                          descEl.innerText = packageData?.packageDescription;
                          moreBtnEl.style.display = "none";
                          lessBtnEl.style.display = "flex";
                        }
                      }}
                      className="w-max font-semibold flex items-center gap-2 text-gray-600 hover:underline"
                    >
                      More <FaArrowDown />
                    </button>
                    <button
                      id="lessBtn"
                      onClick={() => {
                        const descEl = document.getElementById("desc");
                        const moreBtnEl = document.getElementById("moreBtn");
                        const lessBtnEl = document.getElementById("lessBtn");
                        if (descEl && moreBtnEl && lessBtnEl) {
                          descEl.innerText =
                            packageData?.packageDescription.substring(0, 150) + "...";
                          lessBtnEl.style.display = "none";
                          moreBtnEl.style.display = "flex";
                        }
                      }}
                      className="w-max font-semibold ml-2 hidden items-center gap-2 text-gray-600 hover:underline"
                    >
                      Less <FaArrowUp />
                    </button>
                  </>
                ) : (
                  packageData?.packageDescription
                )}
              </p>
            </div>

            {/* Book Button */}
            {currentUser?.user_role !== 1 && (
              <div className="w-full flex justify-center sm:justify-normal">
                <button
                  type="button"
                  onClick={() => {
                    if (currentUser) {
                      navigate(`/booking/${params?.id}`);
                    } else {
                      navigate("/login");
                    }
                  }}
                  className="w-full sm:w-[200px] bg-green-700 text-white rounded p-3 hover:opacity-95"
                >
                  Book Now
                </button>
              </div>
            )}

            {/* Accommodation */}
            <div className="w-full flex flex-col mt-2">
              <h4 className="text-xl">Accommodation</h4>
              <p>{packageData?.packageAccommodation}</p>
            </div>

            {/* Activities */}
            <div className="w-full flex flex-col mt-2">
              <h4 className="text-xl">Activities</h4>
              <p>{packageData?.packageActivities}</p>
            </div>

            {/* Meals */}
            <div className="w-full flex flex-col mt-2">
              <h4 className="text-xl">Meals</h4>
              <p>{packageData?.packageMeals}</p>
            </div>

            <hr />

            {/* Ratings & Reviews Section */}
            <div className="w-full flex flex-col mt-2 items-center">
              {packageRatings && (
                <>
                  <h4 className="text-xl">Ratings & Reviews</h4>

                  {/* Rating Input Form */}
                  <div
                    className={`w-full sm:max-w-[640px] gap-2 ${
                      !currentUser || ratingGiven || !hasBooked ? "hidden" : "flex flex-col items-center"
                    }`}
                  >
                    <Rating
                      name="simple-controlled"
                      className="w-max"
                      value={ratingsData?.rating}
                      onChange={(e, newValue) => {
                        setRatingsData({
                          ...ratingsData,
                          rating: newValue,
                        });
                      }}
                    />
                    <textarea
                      className="w-full resize-none p-3 border border-black rounded"
                      rows={3}
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
                      className="w-full p-2 bg-green-700 text-white rounded disabled:opacity-80 hover:opacity-95"
                    >
                      {loading ? "Submitting..." : "Submit Review"}
                    </button>
                    <hr />
                  </div>

                  {/* Ratings Display Grid */}
                  <div className="mt-3 w-full gap-2 grid 2xl:grid-cols-6 xl:grid-cols-5 xlplus:grid-cols-4 lg:grid-cols-3 md:grid-cols-2">
                    <RatingCard packageRatings={packageRatings} />
                    {packageData?.packageTotalRatings > 4 && (
                      <button
                        onClick={() =>
                          navigate(`/package/ratings/${params?.id}`)
                        }
                        className="flex items-center justify-center text-lg gap-2 p-2 rounded border hover:bg-slate-500 hover:text-white"
                      >
                        View All <FaArrowRight />
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Login Prompt */}
              {!currentUser && (
                <button
                  onClick={() => {
                    navigate("/login");
                  }}
                  className="p-2 rounded text-white bg-green-700"
                >
                  Log In to Rate Package
                </button>
              )}

              {/* Booking Required Message */}
              {currentUser && !hasBooked && !ratingGiven && (
                <p className="text-sm text-gray-600 mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  You need to book this package before you can rate it.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Package;