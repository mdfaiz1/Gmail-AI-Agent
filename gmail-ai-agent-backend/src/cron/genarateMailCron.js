import cron from "node-cron";
import { EmailThread } from "../models/emailLog.model.js";
import { generateReply } from "../services/googleGemini.js";

// Helper function to save to DB (as requested)
const saveReplyToDatabase = async (threadId, replyMsg) => {
  try {
    // console.log(replyMsg.message);
    // console.log(replyMsg.subject);
    if (!threadId) {
      console.error("[Error] threadId is required to save reply.");
      return;
    }
    if (!replyMsg || !replyMsg.message) {
      console.error(`[Error] Invalid reply message for thread ID: ${threadId}`);
      return;
    }
    await EmailThread.findByIdAndUpdate(threadId, {
      generatedReply: replyMsg,
      status: "DRAFT_GENERATED",
    });
    console.log(`[Success] Reply saved for thread ID: ${threadId}`);
  } catch (error) {
    console.error(`[DB Error] Failed to save reply for ${threadId}:`, error);
  }
};

export const startGenerateMailCron = () => {
  // Runs every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    // cron.schedule("*/10 * * * * *", async () => {
    console.log("[Cron] Checking for emails needing replies...");

    try {
      const pendingEmails = await EmailThread.find({
        $or: [{ status: "PROCESSING" }, { generatedReply: { $exists: false } }],
      }).limit(5);

      if (pendingEmails.length === 0) {
        console.log("[Cron] No pending emails found.");
        return;
      }

      // 2. Process each email
      for (const email of pendingEmails) {
        try {
          const emailContext = email.originalMessage.snippet;

          if (!emailContext) {
            console.log(`[Skip] No content found for email ${email._id}`);
            continue;
          }

          // Call Gemini
          const tone = "Professional and concise";
          const generatetedMsg = email.generatedReply;
          const plainTextReply = await generateReply(
            tone,
            emailContext,
            generatetedMsg
          );

          // 3. Save the result
          if (plainTextReply) {
            // console.log(plainTextReply);
            await saveReplyToDatabase(email._id, plainTextReply);
          }
        } catch (innerError) {
          console.error(
            `[Error] Failed processing email ${email._id}:`,
            innerError
          );
          // Loop continues to next email
        }
      }
    } catch (error) {
      console.error("[Cron] Critical error in mail generator:", error);
    }
  });
};
