import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  checkGuideStatus,
  deleteGuideApplication,
  getAllGuideApplications,
  getApprovedGuides,
  getGuideApplicationById,
  submitGuideApplication,
  updateApplicationStatus,
} from "../controllers/guideApplication.controller.js";

const router = express.Router();

// Submit guide application (public)
router.post("/submit-application", submitGuideApplication);

// Get all applications (admin only)
router.get(
  "/get-all-applications",
  requireSignIn,
  isAdmin,
  getAllGuideApplications
);

// Get single application by ID (admin only)
router.get(
  "/get-application/:id",
  requireSignIn,
  isAdmin,
  getGuideApplicationById
);

// Update application status (admin only)
router.put(
  "/update-status/:id",
  requireSignIn,
  isAdmin,
  updateApplicationStatus
);

// Delete application (admin only)
router.delete(
  "/delete-application/:id",
  requireSignIn,
  isAdmin,
  deleteGuideApplication
);

// Get approved guides (public - for users)
router.get("/get-approved-guides", getApprovedGuides);

// Check guide status by email (authenticated)
router.get("/check-guide-status/:email", requireSignIn, checkGuideStatus);

export default router;
