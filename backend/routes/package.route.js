import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createPackage,
  deletePackage,
  getPackageData,
  getPackages,
  getRecommendedPackages,
  stripePaymentIntentController,
  stripePublishableKeyController,
  updatePackage,
  verifyStripePayment,
} from "../controllers/package.controller.js";

const router = express.Router();

//create package
router.post("/create-package", requireSignIn, isAdmin, createPackage);

//update package by id
router.post("/update-package/:id", requireSignIn, isAdmin, updatePackage);

//delete package by id
router.delete("/delete-package/:id", requireSignIn, isAdmin, deletePackage);

//get all packages
router.get("/get-packages", getPackages);

//get recommended packages
router.get("/get-recommended-packages", getRecommendedPackages);

//get single package data by id
router.get("/get-package-data/:id", getPackageData);

//payments routes - Stripe
//get publishable key
router.get("/stripe/config", stripePublishableKeyController);

//create payment intent
router.post("/stripe/create-payment-intent", stripePaymentIntentController);

//verify payment
router.post("/stripe/verify-payment", verifyStripePayment);

export default router;
