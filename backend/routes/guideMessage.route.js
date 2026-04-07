import express from "express";
import { requireSignIn } from "../middlewares/authMiddleware.js";
import {
  sendMessageToGuide,
  getGuideMessages,
  getUserMessages,
  markMessageAsRead,
  updateMessageStatus,
  deleteGuideMessage,
  getAllMessages,
} from "../controllers/guideMessage.controller.js";

const router = express.Router();

// Send message to guide (authenticated users)
router.post("/send-message", requireSignIn, sendMessageToGuide);

// Get messages for a guide (authenticated)
router.get("/get-messages/:guideEmail", requireSignIn, getGuideMessages);

// Get messages sent by a user (for notifications)
router.get("/get-user-messages/:userEmail", requireSignIn, getUserMessages);

// Get all messages (for admin)
router.get("/get-all-messages", requireSignIn, getAllMessages);

// Mark message as read
router.put("/mark-read/:id", requireSignIn, markMessageAsRead);

// Update message status (approve/reject)
router.put("/update-status/:id", requireSignIn, updateMessageStatus);

// Delete message
router.delete("/delete-message/:id", requireSignIn, deleteGuideMessage);

export default router;
