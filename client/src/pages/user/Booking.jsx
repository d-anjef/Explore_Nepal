import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

const Booking = () => {
  const { currentUser } = useSelector((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState({
    packageName: "",
    packageDescription: "",
    packageDestination: "",
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
  const [bookingData, setBookingData] = useState({
    totalPrice: 0,
    packageDetails: null,
    buyer: null,
    persons: 1,
    date: null,
  });
  const [currentDate, setCurrentDate] = useState("");

  const getPackageData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/package/get-package-data/${params?.packageId}`
      );
      const data = await res.json();
      if (data?.success) {
        setPackageData({
          packageName: data?.packageData?.packageName,
          packageDescription: data?.packageData?.packageDescription,
          packageDestination: data?.packageData?.packageDestination,
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
    }
  };

  // simple booking without online payment
  const handleBookPackage = async () => {
    if (
      !bookingData.packageDetails ||
      !bookingData.buyer ||
      bookingData.totalPrice <= 0 ||
      bookingData.persons <= 0 ||
      !bookingData.date
    ) {
      toast.error("Please select a date and number of persons");
      return;
    }

    // extra safety: prevent booking for past dates
    const today = new Date().toISOString().substring(0, 10);
    if (bookingData.date < today) {
      toast.error("Please select a future date for your trip");
      return;
    }

    // Navigate to Stripe checkout with booking details
    navigate("/stripe-checkout", {
      state: {
        bookingDetails: {
          ...bookingData,
          packageName: packageData.packageName,
          packageId: params?.packageId,
        },
        packageData: packageData,
      },
    });
  };

  useEffect(() => {
    if (params?.packageId) {
      getPackageData();
    }
    let date = new Date().toISOString().substring(0, 10);
    let d = date.substring(0, 8) + (parseInt(date.substring(8)) + 1);
    setCurrentDate(d);
  }, [params?.packageId]);

  useEffect(() => {
    if (packageData && params?.packageId) {
      setBookingData((prev) => {
        const pricePerPerson =
          packageData?.packageDiscountPrice || packageData?.packagePrice;
        return {
          ...prev,
          packageDetails: params?.packageId,
          buyer: currentUser?._id,
          totalPrice: pricePerPerson * prev.persons,
        };
      });
    }
  }, [packageData, params, currentUser?._id]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-[95%] flex flex-col items-center p-6 rounded shadow-2xl gap-3">
        <h1 className="text-center font-bold text-2xl">Book Package</h1>
        {/* user info */}
        <div className="w-full flex flex-wrap justify-center gap-2">
          <div className="pr-3 md:border-r md:pr-6">
            <div className="flex flex-col p-2 w-64 xsm:w-72 h-fit gap-2">
              <div className="flex flex-col">
                <label htmlFor="username" className="font-semibold">
                  Username:
                </label>
                <input
                  type="text"
                  id="username"
                  className="p-1 rounded border border-black"
                  value={currentUser.username}
                  disabled
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="email" className="font-semibold">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  className="p-1 rounded border border-black"
                  value={currentUser.email}
                  disabled
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="address" className="font-semibold">
                  Address:
                </label>
                <textarea
                  maxLength={200}
                  type="text"
                  id="address"
                  className="p-1 rounded border border-black resize-none"
                  value={currentUser.address}
                  disabled
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="phone" className="font-semibold">
                  Phone:
                </label>
                <input
                  type="text"
                  id="phone"
                  className="p-1 rounded border border-black"
                  value={currentUser.phone}
                  disabled
                />
              </div>
            </div>
          </div>
          {/* package info */}
          <div className="pl-3 md:border-l md:pl-6">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap gap-2">
                <img
                  className="w-28"
                  src={packageData.packageImages?.[0] || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"}
                  alt="Package image"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop";
                  }}
                />
                <div>
                  <p className="font-semibold text-lg mb-1 capitalize">
                    {packageData.packageName}
                  </p>
                  <p className="flex gap-2 text-green-700 font-semibold capitalize">
                    <FaMapMarkerAlt /> {packageData.packageDestination}
                  </p>
                  {/* days & nights */}
                  {(+packageData.packageDays > 0 ||
                    +packageData.packageNights > 0) && (
                    <p className="flex items-center gap-2">
                      <FaClock />
                      {+packageData.packageDays > 0 &&
                        (+packageData.packageDays > 1
                          ? packageData.packageDays + " Days"
                          : packageData.packageDays + " Day")}
                      {+packageData.packageDays > 0 &&
                        +packageData.packageNights > 0 &&
                        " - "}
                      {+packageData.packageNights > 0 &&
                        (+packageData.packageNights > 1
                          ? packageData.packageNights + " Nights"
                          : packageData.packageNights + " Night")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col my-1">
                <label className="font-semibold" htmlFor="date">
                  Select Date:
                </label>
                <input
                  type="date"
                  min={currentDate !== "" ? currentDate : ""}
                  //   min={"2024-01-23"}
                  id="date"
                  className="w-max border rounded"
                  onChange={(e) => {
                    setBookingData({ ...bookingData, date: e.target.value });
                  }}
                />
              </div>
              {/* price */}
              <p className="flex gap-1 text-xl font-semibold my-1">
                Price:
                {packageData.packageOffer ? (
                  <>
                    <span className="line-through text-gray-700">
                      Rs {packageData.packagePrice}
                    </span>{" "}
                    -<span>Rs {packageData.packageDiscountPrice}</span>
                    <span className="text-lg ml-2 bg-green-700 p-1 rounded text-white">
                      {Math.floor(
                        ((+packageData.packagePrice -
                          +packageData.packageDiscountPrice) /
                          +packageData.packagePrice) *
                          100
                      )}
                      % Off
                    </span>
                  </>
                ) : (
                  <span className="text-green-700">
                    Rs {packageData.packagePrice}
                  </span>
                )}
              </p>
              {/* price */}
              <div className="flex border-2 w-max">
                <button
                  type="button"
                  className="p-2 py-1 font-semibold"
                  onClick={() => {
                    setBookingData((prev) => {
                      if (prev.persons <= 1) return prev;
                      const newPersons = prev.persons - 1;
                      const pricePerPerson =
                        packageData.packageDiscountPrice ||
                        packageData.packagePrice;
                      return {
                        ...prev,
                        persons: newPersons,
                        totalPrice: pricePerPerson * newPersons,
                      };
                    });
                  }}
                >
                  -
                </button>
                <input
                  value={bookingData.persons}
                  disabled
                  type="text"
                  className="border w-10 text-center text-lg"
                />
                <button
                  type="button"
                  className="p-2 py-1 font-semibold"
                  onClick={() => {
                    setBookingData((prev) => {
                      if (prev.persons >= 10) return prev;
                      const newPersons = prev.persons + 1;
                      const pricePerPerson =
                        packageData.packageDiscountPrice ||
                        packageData.packagePrice;
                      return {
                        ...prev,
                        persons: newPersons,
                        totalPrice: pricePerPerson * newPersons,
                      };
                    });
                  }}
                >
                  +
                </button>
              </div>
              <p className="text-xl font-semibold">
                Total Price:
                <span className="text-green-700">
                  {" "}Rs{" "}
                  {packageData.packageDiscountPrice
                    ? packageData.packageDiscountPrice * bookingData.persons
                    : packageData.packagePrice * bookingData.persons}
                </span>
              </p>
              <div className="my-2 max-w-[300px] gap-1">
                <p className="font-semibold mb-2">Booking:</p>
                <button
                  className="w-full p-3 mb-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleBookPackage}
                  disabled={!bookingData.date || !currentUser?.address || loading}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
