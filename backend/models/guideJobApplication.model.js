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
  },
  { timestamps: true }
);

const GuideJobApplication = mongoose.model(
  "GuideJobApplication",
  guideJobApplicationSchema
);

export default GuideJobApplication;
