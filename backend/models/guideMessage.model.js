import mongoose from "mongoose";

const guideMessageSchema = new mongoose.Schema(
  {
    guideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GuideJobApplication",
      required: true,
    },
    guideName: {
      type: String,
      required: true,
    },
    guideEmail: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userPhone: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    tourDays: {
      type: Number,
      required: true,
    },
    tourDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["unread", "read", "approved", "rejected"],
      default: "unread",
    },
  },
  { timestamps: true }
);

const GuideMessage = mongoose.model("GuideMessage", guideMessageSchema);

export default GuideMessage;
