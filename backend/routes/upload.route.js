import express from "express";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Upload single image
router.post("/single", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size is 5MB",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading image",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: imageUrl,
    });
  });
});

// Upload multiple images (up to 5)
router.post("/multiple", (req, res) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: "One or more files exceed the 5MB size limit",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading images",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      imageUrls: imageUrls,
    });
  });
});

export default router;
