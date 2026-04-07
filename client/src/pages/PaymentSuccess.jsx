import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Assuming eSewa sends query params like ?oid=ORDERID&amt=AMOUNT&refId=REFID
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get("oid");
  const paymentRef = searchParams.get("refId");
  const amount = searchParams.get("amt");

  useEffect(() => {
    // Call backend to confirm and save payment
    const savePayment = async () => {
      try {
        await axios.post("/api/bookings/payment-success", {
          orderId,
          paymentRef,
          amount,
          paymentMethod: "eSewa",
        });
        navigate("/"); // redirect to home or bookings page
      } catch (err) {
        console.error("Payment confirmation failed:", err);
      }
    };
    savePayment();
  }, [orderId, paymentRef, amount, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Payment Successful!</h2>
      <p>Redirecting...</p>
    </div>
  );
};

export default PaymentSuccess;
