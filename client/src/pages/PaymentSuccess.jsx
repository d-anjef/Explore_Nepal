import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const hasVerified = useRef(false);

  useEffect(() => {
    const verify = async () => {
      const fullUrl = window.location.href;

      // ✅ Extract eSewa data safely
      const dataMatch = fullUrl.match(/[?&]data=([^&]+)/);
      const data = dataMatch ? dataMatch[1] : null;

      // ✅ Get booking from sessionStorage
      const bookingStr = sessionStorage.getItem("booking");

      console.log("Extracted data:", data);
      console.log("Stored booking:", bookingStr);

      if (!data || !bookingStr) {
        toast.error("Payment data missing or corrupted.");
        return navigate("/home");
      }

      // Prevent duplicate calls
      if (hasVerified.current) return;
      hasVerified.current = true;

      try {
        const decodedBooking = JSON.parse(bookingStr);

        const res = await fetch("/api/payment/verify-esewa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            encodedData: data,
            bookingDetails: decodedBooking,
          }),
        });

        const result = await res.json();

        if (result.success) {
          toast.success("Booking Confirmed!");
          
          // ✅ Clear storage after success
          sessionStorage.removeItem("booking");

          navigate("/profile/user");
        } else {
          toast.error(result.message || "Database error.");
          navigate("/home");
        }
      } catch (err) {
        console.error("Verification Error:", err);
        toast.error("Technical error during confirmation.");
        navigate("/home");
      }
    };

    verify();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-green-600 mb-6 mx-auto"></div>
        <h2 className="text-2xl font-bold text-gray-800">
          Verifying Your Booking
        </h2>
        <p className="text-gray-500 mt-2">
          Connecting to secure servers...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;