import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

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
const CheckoutForm = ({ onSuccess, onError, bookingDetails }) => {
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
        onError(submitError.message);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment successful
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      setError(err.message);
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form">
      <div className="mb-4">
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
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
        {loading ? "Processing..." : `Pay $${bookingDetails.totalPrice}`}
      </button>

      <p className="text-xs text-gray-500 text-center mt-3">
        Powered by Stripe • Secure Payment
      </p>
    </form>
  );
};

// Main Stripe Payment Component
const StripePaymentForm = ({ packageData, bookingDetails, onPaymentSuccess }) => {
  const [clientSecret, setClientSecret] = useState("");
  const [stripeInstance, setStripeInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
            packageId: packageData._id,
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
  }, [packageData, bookingDetails]);

  const handleSuccess = async (paymentIntentId) => {
    try {
      // Create booking in database
      const res = await fetch(`/api/booking/book-package/${packageData._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingDetails,
          paymentMethod: "stripe",
          paymentId: paymentIntentId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onPaymentSuccess(paymentIntentId);
      } else {
        setError(data.message || "Failed to create booking");
      }
    } catch (err) {
      setError("Failed to complete booking. Please contact support.");
      console.error(err);
    }
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-semibold">Payment Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#2563eb",
      },
    },
  };

  return (
    <div className="stripe-payment-wrapper">
      {clientSecret && stripeInstance && (
        <Elements stripe={stripeInstance} options={options}>
          <CheckoutForm
            onSuccess={handleSuccess}
            onError={handleError}
            bookingDetails={bookingDetails}
          />
        </Elements>
      )}
    </div>
  );
};

export default StripePaymentForm;
