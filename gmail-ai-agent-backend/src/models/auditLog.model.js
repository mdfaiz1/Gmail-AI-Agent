import mongoose, { Schema } from "mongoose";

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true }, // e.g., 'FETCH_EMAILS', 'GENERATE_DRAFT', 'SEND_EMAIL'
  status: { type: String, enum: ["SUCCESS", "ERROR"], required: true },
  details: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

export const AuditLog = mongoose.model("AuditLog", logSchema);
