import express, { Router } from "express";
import {
  bookPackage,
  cancelBooking,
  checkBooking,
  deleteBookingHistory,
  getAllBookings,
  getAllUserBookings,
  getCurrentBookings,
  getUserCurrentBookings,
} from "../controllers/booking.controller.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// check if user has booked a package
router.get("/check-booking/:userId/:packageId", checkBooking);

// book package
router.post("/book-package/:packageId", requireSignIn, bookPackage);

//get all current bookings admin
router.get("/get-currentBookings", requireSignIn, isAdmin, getCurrentBookings);

//get all bookings admin
router.get("/get-allBookings", requireSignIn, isAdmin, getAllBookings);

//get all current bookings by user id
router.get(
  "/get-UserCurrentBookings/:id",
  requireSignIn,
  getUserCurrentBookings
);

//get all bookings by user id
router.get("/get-allUserBookings/:id", requireSignIn, getAllUserBookings);

//delete history of booking
router.delete(
  "/delete-booking-history/:id/:userId",
  requireSignIn,
  deleteBookingHistory
);

//cancle booking by id
router.post("/cancel-booking/:id/:userId", requireSignIn, cancelBooking);

// backend/routes/bookings.js
router.post("/payment-success", async (req, res) => {
  const { orderId, paymentRef, amount, paymentMethod } = req.body;
  try {
    const booking = await Booking.findById(orderId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.isPaid = true;
    booking.paymentMethod = paymentMethod;
    booking.paymentResult = paymentRef;
    await booking.save();

    res.status(200).json({ message: "Payment recorded successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
