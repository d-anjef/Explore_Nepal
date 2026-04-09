import mongoose from "mongoose";

const guideJobApplicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Recommended to prevent duplicate applications
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    languages: {
      type: String,
      required: true,
    },
    certifications: {
      type: String,
    },
    coverLetter: {
      type: String,
      required: true,
    },
    resume: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // --- NEW ELITE PORTFOLIO FIELDS ---
    expertiseAreas: {
      type: [String],
      default: ["Trekking", "Cultural Tours", "Photography"],
    },
    signatureRoutes: {
      type: [String],
      default: ["Everest Base Camp", "Annapurna Circuit"],
    },
    gearList: {
      type: [String],
      default: ["First Aid Kit", "GPS Tracker", "Oxy-meter"],
    },
    totalGroupsLed: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    safetyScore: {
      type: String,
      default: "99%",
    }
  },
  { timestamps: true }
);

const GuideJobApplication = mongoose.model(
  "GuideJobApplication",
  guideJobApplicationSchema
);

export default GuideJobApplication;