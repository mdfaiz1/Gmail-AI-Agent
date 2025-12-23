import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    picture: { type: String },

    accessToken: { type: String },
    refreshToken: { type: String },
    tokenExpiry: { type: Number },
    isSyncActive: {
      type: Boolean,
      default: false, // Default to OFF when they register
    },

    // --- Cron Job Fields ---
    // 1. Logic: "When did we last finish checking this user?"
    lastEmailFetch: { type: Date, default: null },

    // 2. Logic: "Is this user currently being processed?" (The Lock)
    fetchLockUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index for speed
userSchema.index({ fetchLockUntil: 1, lastEmailFetch: 1 });

export const User = mongoose.model("User", userSchema);
