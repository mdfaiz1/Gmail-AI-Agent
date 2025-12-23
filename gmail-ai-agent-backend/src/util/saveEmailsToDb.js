import { EmailThread } from "../models/emailLog.model.js";

export const saveEmailsToDb = async (userId, parsedEmails) => {
  if (parsedEmails.length === 0) return 0;

  // 1. Prepare documents for insertion
  const emailDocs = parsedEmails.map(email => ({
    userId: userId,
    messageId: email.id, // Root level ID
    threadId: email.threadId, // Root level Thread ID
    status: "NEW", // Default status
    originalMessage: {
      ...email, // Spread the parsed content (subject, body, snippet)
      receivedAt: new Date(parseInt(email.internalDate)),
    },
  }));

  try {
    // 2. Bulk Insert
    // ordered: false = If one fails (duplicate), keep saving the others!
    const result = await EmailThread.insertMany(emailDocs, { ordered: false });
    console.log(`[DB] Successfully inserted ${result.length} emails.`);
    return result.length;
  } catch (error) {
    // If some emails were duplicates, insertMany throws an error but still inserts the rest.
    // We check if it's a duplicate key error (code 11000)
    if (error.code === 11000) {
      console.log(`[DB] Partial batch saved. Some emails were duplicates.`);
      return error.result.nInserted; // Return how many actually succeeded
    } else {
      console.error("[DB] InsertMany Error:", error);
      throw error;
    }
  }
};

export const saveReplyToDatabase = async (id, replyMsg) => {
  try {
    // const result =  await EmailThread.findByIdAndUpdate(id, {
    //   generatedReply.message : replyMsg,
    // })
  } catch (error) {
    console.error(`[DB Error] Failed to save reply for ${id}:`, error);
    throw error;
  }
};
