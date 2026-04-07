import express from "express";
import { initiateEsewaPayment, verifyEsewaPayment } from "../controllers/esewaController.js";

const router = express.Router();

router.post("/esewa", initiateEsewaPayment);
router.post("/verify-esewa", verifyEsewaPayment); // Ensure this route exists

export default router;