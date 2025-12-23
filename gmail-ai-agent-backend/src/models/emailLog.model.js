import mongoose from "mongoose";
import { type } from "os";

const EmailThreadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Root level ID for fast duplicate checking
    messageId: { type: String, required: true, unique: true },
    threadId: { type: String, required: true },

    status: {
      type: String,
      enum: [
        "NEW",
        "PROCESSING",
        "DRAFT_GENERATED",
        "SENDING",
        "SENT",
        "FAILED",
        "CANCELLED",
      ],
      default: "NEW",
    },

    // Content
    originalMessage: {
      sender: String,
      subject: String,
      snippet: String,
      cc: String,
      bcc: String,
      receivedAt: Date,
    },
    generatedReply: {
      message: { type: String },
      subject: { type: String },
    },
    sentAt: { type: Date, default: null },

    // Error tracking
    error: { type: String, default: null },
  },
  { timestamps: true }
);

// Indexes for performance
EmailThreadSchema.index({ userId: 1, messageId: 1 });
EmailThreadSchema.index({ status: 1 });

export const EmailThread = mongoose.model("EmailThread", EmailThreadSchema);
