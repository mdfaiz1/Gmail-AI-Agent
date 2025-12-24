import cron from "node-cron";
import { google } from "googleapis";
import { EmailThread } from "../models/emailLog.model.js";
import { User } from "../models/user.model.js"; // Import your User model
import dotenv from "dotenv";
import { sendSingleEmailService } from "../services/gmailService.js";
import { decrypt } from "../services/encryption.js";

dotenv.config();

let isJobRunning = false;

export const startSendMailCron = () => {
  cron.schedule("*/10 * * * * *", async () => {
    if (isJobRunning) {
      // console.log("[SendCron] Previous job busy. Skipping.");
      return;
    }

    isJobRunning = true;
    // console.log("[SendCron] Checking for emails to send...");

    try {
      // 1. Fetch emails to send.
      // IMPORTANT: Populate 'userId' if it's a reference, or ensure the field exists.
      const queuedEmails = await EmailThread.find({ status: "SENDING" }).limit(
        10
      );

      if (queuedEmails.length === 0) {
        console.log("[SendCron] No queued emails found.");
        return;
      }

      // 2. Process each email individually
      for (const email of queuedEmails) {
        try {
          // A. Fetch the User who owns this email thread
          const user = await User.findById(email.userId);

          if (!user || !user.refreshToken) {
            // console.error(
            //   `[SendCron] User or Refresh Token missing for email ${email._id}`
            // );
            email.status = "FAILED";
            await email.save();
            continue; // Skip to next email
          }

          // B. Setup OAuth Client SPECIFIC to this user
          const oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
          );

          oAuth2Client.setCredentials({
            access_token: user.accessToken,
            refresh_token: user.refreshToken
              ? decrypt(user.refreshToken)
              : null,
          });

          // C. Initialize Gmail API with this user's auth
          const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

          // D. Call the Service
          await sendSingleEmailService(email, gmail);

          // Rate limit protection
          await new Promise(r => setTimeout(r, 1000));
        } catch (innerError) {
          console.error(
            `[SendCron] Error processing email ${email._id}:`,
            innerError
          );
        }
      }
    } catch (error) {
      console.error("[SendCron] Critical error:", error);
    } finally {
      isJobRunning = false;
    }
  });
};
