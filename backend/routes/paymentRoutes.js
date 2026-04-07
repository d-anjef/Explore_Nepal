import express from "express";
import { initiateEsewaPayment } from "../controllers/esewaController.js";

const router = express.Router();

router.post("/esewa", initiateEsewaPayment);

export default router;
