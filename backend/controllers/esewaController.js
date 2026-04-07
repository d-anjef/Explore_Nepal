import crypto from "crypto";
import Booking from "../models/booking.model.js";

export const initiateEsewaPayment = async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    // Clean ID
    const safeBookingId = String(bookingId).replace(/[^a-zA-Z0-9]/g, "");
    const transaction_uuid = `${safeBookingId}-${Date.now()}`;

    const secret = "8gBm/:&EnhH.1/q";
    const product_code = "EPAYTEST";

    const message = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const signature = crypto
      .createHmac("sha256", secret)
      .update(message)
      .digest("base64");

    // ✅ CLEAN URL (NO BOOKING DATA HERE)
    const success_url = `http://localhost:5173/payment-success`;
    const failure_url = `http://localhost:5173/payment-failure`;

    const paymentData = {
      amount,
      tax_amount: 0,
      total_amount: amount,
      transaction_uuid,
      product_code,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url,
      failure_url,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
    };

    res.status(200).json(paymentData);
  } catch (error) {
    console.error("Initiate Error:", error);
    res.status(500).json({
      success: false,
      message: "Initiation failed",
    });
  }
};

export const verifyEsewaPayment = async (req, res) => {
  try {
    const { encodedData, bookingDetails } = req.body;

    if (!encodedData || !bookingDetails) {
      return res.status(400).json({
        success: false,
        message: "Missing payment data",
      });
    }

    // Decode eSewa response
    const decodedString = Buffer.from(encodedData, "base64").toString("utf-8");
    const responseData = JSON.parse(decodedString);

    console.log("eSewa Response:", responseData);

    if (responseData.status !== "COMPLETE") {
      return res.status(400).json({
        success: false,
        message: "Payment incomplete",
      });
    }

    // Save booking
    const newBooking = new Booking({
      ...bookingDetails,
      paymentMethod: "esewa",
      paymentId: responseData.transaction_code,
      status: "Booked",
    });

    await newBooking.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({
      success: false,
      message: "Database save failed",
    });
  }
};