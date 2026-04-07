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
  const payWithEsewa = async () => {
  try {
    const res = await fetch("/api/payment/esewa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: bookingDetails.totalPrice,
        bookingId: bookingDetails.packageDetails,
      }),
    });

    const data = await res.json();

    if (!data) {
      toast.error("Failed to initialize eSewa payment");
      return;
    }

    // Create form dynamically
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    Object.keys(data).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = data[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    console.error(error);
    toast.error("eSewa payment failed");
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
          <h1 className="text-3xl font-bold text-center">Stripe Payment</h1>
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

          {/* Payment Form */}
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
              <h2 className="text-xl font-semibold mb-4">Payment Options</h2>
              <Elements stripe={stripeInstance} options={options}>
                <CheckoutForm
                  bookingDetails={bookingDetails}
                  packageData={packageData}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </div>
          )}
          <div className="mt-6">
  <p className="text-center text-gray-500 mb-3">OR</p>

  <button
    onClick={payWithEsewa}
    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
  >
    Pay with eSewa
  </button>
</div>

        </div>
      </div>
    </div>
    
  );
};

export default StripeCheckout;
