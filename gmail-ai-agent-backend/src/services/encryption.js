// src/services/encryption.js (Corrected)
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const ALGORITHM = "aes-256-gcm";
// NOTE: Ensure ENCRYPTION_KEY is a 64-char hex string in .env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 12;

export const encrypt = text => {
  if (!text) return null; // Safety check

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"), // 🛑 FIX 1: Add 'hex' encoding here
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

export const decrypt = text => {
  if (!text) return null; // Safety check

  const [ivHex, authTagHex, encryptedHex] = text.split(":");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"), // 🛑 FIX 2: Add 'hex' encoding here
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  try {
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    // IMPORTANT: Handle authentication failure (if AuthTag is wrong)
    console.error(
      "Decryption failed (Authentication tag mismatch or key error):",
      error
    );
    return null;
  }
};
