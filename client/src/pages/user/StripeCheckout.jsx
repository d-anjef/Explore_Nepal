import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { FaArrowLeft } from "react-icons/fa";

// Initialize Stripe
let stripePromise = null;

const getStripe = async () => {
  if (!stripePromise) {
    try {
      const res = await fetch("/api/package/stripe/config");
      const data = await res.json();
      if (data.success) {
        stripePromise = loadStripe(data.publishableKey);
      }
    } catch (error) {
      console.error("Error loading Stripe:", error);
    }
  }
  return stripePromise;
};

// Checkout Form Component
const CheckoutForm = ({ bookingDetails, packageData, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment(
        {
          elements,
          redirect: "if_required",
          confirmParams: {
            return_url: `${window.location.origin}/payment-success`,
          },
        }
      );

      if (submitError) {
        setError(submitError.message);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment successful - create booking
        await onSuccess(paymentIntent.id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <style>{`
        .p-LinkAuthenticationElement,
        [class*="LinkAuthenticationElement"] {
          display: none !important;
        }
      `}</style>
      <div className="mb-6">
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Payment Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
          !stripe || loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Processing..." : `Pay Rs ${bookingDetails.totalPrice}`}
      </button>
    </form>
  );
};

// Main Stripe Checkout Component
const StripeCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [clientSecret, setClientSecret] = useState("");
  const [stripeInstance, setStripeInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get booking details from location state
  const { bookingDetails, packageData } = location.state || {};

  useEffect(() => {
    // Redirect if no booking details
    if (!bookingDetails || !packageData) {
      toast.error("No booking details found!");
      navigate(-1);
      return;
    }

    const initializePayment = async () => {
      try {
        // Load Stripe
        const stripe = await getStripe();
        setStripeInstance(stripe);

        // Create payment intent
        const res = await fetch("/api/package/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: bookingDetails.totalPrice,
            packageId: packageData._id || bookingDetails.packageDetails,
            packageName: packageData.packageName,
          }),
        });

        const data = await res.json();

        if (data.success) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.message || "Failed to initialize payment");
        }
      } catch (err) {
        setError("Failed to initialize payment. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [bookingDetails, packageData, navigate]);

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      // Create booking in database
      const res = await fetch(
        `/api/booking/book-package/${bookingDetails.packageDetails}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...bookingDetails,
            paymentMethod: "stripe",
            paymentId: paymentIntentId,
          }),
        }
      );

      const data = await res.json();
      console.log("Booking response:", data);

      if (data.success) {
        toast.success("Booking confirmed successfully!");
        
        // Store guide request data in sessionStorage to show prompt on profile page
        sessionStorage.setItem(
          "guideRequestPrompt",
          JSON.stringify({
            bookingId: data.booking?._id || data.data?._id,
            packageName: packageData.packageName,
            destination: packageData.packageDestination,
            date: bookingDetails.date,
            persons: bookingDetails.persons,
            duration: packageData.packageDays || 1,
          })
        );
        
        navigate(`/profile/${currentUser?.user_role === 1 ? "admin" : "user"}`);
      } else {
        console.error("Booking failed:", data);
        setError(data.message || "Failed to create booking");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setError(`Failed to complete booking: ${err.message}`);
    }
  };

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#2563eb",
      },
    },
    fields: {
      billingDetails: {
        name: 'auto',
        email: 'auto',
        phone: 'auto',
      },
    },
    defaultValues: {
      billingDetails: {
        name: currentUser?.username || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
      },
    },
    wallets: {
      applePay: 'never',
      googlePay: 'never',
    },
  };
  // ... (existing imports and Stripe code)
const payWithEsewa = async () => {
  try {
    const bId = packageData?._id || bookingDetails?.packageId || bookingDetails?.packageDetails;

    if (!bId) {
      return toast.error("Missing Package ID");
    }

    if (!bookingDetails) {
      return toast.error("Booking data missing");
    }

    // ✅ FIX 1: Ensure buyer ID and correct naming for the backend schema
    const finalBookingToStore = {
      ...bookingDetails,
      buyer: currentUser?._id, // Ensure the user ID is included
      packageDetails: bId,      // Align with backend schema naming
      paymentMethod: "esewa"
    };

    // ✅ FIX 2: Store the ENHANCED object, not the incomplete original
    sessionStorage.setItem("booking", JSON.stringify(finalBookingToStore));

    console.log("Stored complete booking details:", finalBookingToStore);

    const res = await fetch("/api/payment/esewa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: bookingDetails.totalPrice,
        bookingId: bId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Server error");
    }

    const form = document.createElement("form");
    form.method = "POST";
    // Using your existing test environment URL
    form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    Object.entries(data).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);

    // Small delay to ensure sessionStorage is committed on all browsers
    setTimeout(() => {
      form.submit();
    }, 300);

  } catch (error) {
    console.error("eSewa Error:", error);
    toast.error(error.message || "Payment failed");
  }
};
  return (
    <div className="w-full min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <FaArrowLeft />
            <span>Back to Booking</span>
          </button>
          <h1 className="text-3xl font-bold text-center">Checkout</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Booking Summary */}
          {packageData && (
            <div className="mb-6 pb-6 border-b">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  <span className="font-semibold">Package:</span>{" "}
                  {packageData.packageName}
                </p>
                <p>
                  <span className="font-semibold">Destination:</span>{" "}
                  {packageData.packageDestination}
                </p>
                <p>
                  <span className="font-semibold">Persons:</span>{" "}
                  {bookingDetails.persons}
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {bookingDetails.date}
                </p>
                <p className="text-xl font-bold text-green-600 mt-4">
                  Total: Rs {bookingDetails.totalPrice}
                </p>
              </div>
            </div>
          )}

          {/* Payment Form (Stripe) */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-3 text-sm underline"
              >
                Go back and try again
              </button>
            </div>
          )}

          {!loading && !error && clientSecret && stripeInstance && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Pay with Card (Stripe)</h2>
              <Elements stripe={stripeInstance} options={options}>
                <CheckoutForm
                  bookingDetails={bookingDetails}
                  packageData={packageData}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </div>
          )}

          {/* eSewa Alternative */}
          {!loading && !error && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-gray-400 mb-4 text-sm font-medium">OR PAY WITH DIGITAL WALLET</p>
              <button
                onClick={payWithEsewa}
                className="w-full bg-[#60bb46] hover:bg-[#52a03c] text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <span className="text-lg">Pay with eSewa</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;