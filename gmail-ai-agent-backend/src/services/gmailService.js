import { google } from "googleapis";
import { User } from "../models/user.model.js";
import { oauth2Client } from "../config/oauthClient.js";
import { EmailThread } from "../models/emailLog.model.js";
import { decrypt } from "./encryption.js";
import { parseEmail } from "../util/parseEmail.js";
import { saveEmailsToDb } from "../util/saveEmailsToDb.js";
import { makeBody } from "../util/makeMsgBody.js";

export const fetchEmailsService = async userId => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (!user || !user.isSyncActive) {
    console.log(`[Service] User ${userId} sync is inactive. Skipping.`);
    return 0;
  }
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken ? decrypt(user.refreshToken) : null,
  });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  let totalSaved = 0;
  let pageToken = null;
  const MAX_WANTED = 15;
  const SAFETY_LIMIT = 5;
  let pagesFetched = 0;

  console.log(`[Service] Starting cycle for user ${userId}`);

  // --- START LOOP ---
  while (totalSaved < MAX_WANTED && pagesFetched < SAFETY_LIMIT) {
    // A. Get List of Message IDs
    const listResp = await gmail.users.messages.list({
      userId: "me",
      maxResults: 15,
      pageToken: pageToken,
      q: `is:unread newer_than:1d -from:noreply -category:promotions -category:social`,
      // q: `is:unread newer_than:10d  -category:promotions -category:social`,
    });

    const messages = listResp.data.messages || [];
    pageToken = listResp.data.nextPageToken;
    pagesFetched++;

    if (messages.length === 0) break;
    const messageIds = messages.map(m => m.id);
    const existing = await EmailThread.find({
      messageId: { $in: messageIds },
    }).select("messageId");
    const existingSet = new Set(existing.map(e => e.messageId));
    const newMessagesToFetch = messages.filter(m => !existingSet.has(m.id));
    if (newMessagesToFetch.length === 0) {
      if (!pageToken) break;
      continue;
    }
    const fullEmailsData = await Promise.all(
      newMessagesToFetch.map(async msg => {
        try {
          const detail = await gmail.users.messages.get({
            userId: "me",
            id: msg.id,
            format: "full",
          });
          return {
            id: msg.id,
            threadId: detail.data.threadId,
            internalDate: detail.data.internalDate,
            ...parseEmail(detail.data),
          };
        } catch (err) {
          console.error(`Failed to fetch email ${msg.id}`, err.message);
          return null;
        }
      })
    );
    console.log(fullEmailsData);
    const validEmails = fullEmailsData.filter(e => e !== null);
    const savedCount = await saveEmailsToDb(userId, validEmails);
    totalSaved += savedCount;
    if (!pageToken) break;
  }
  console.log(
    `[Service] Cycle finished. Total new emails saved: ${totalSaved}`
  );
  return totalSaved;
};

export const sendSingleEmailService = async (emailDoc, gmailClient) => {
  try {
    const messageBody = emailDoc.generatedReply.message || " ";
    let subject = emailDoc.generatedReply.subject || "(No Subject)";

    if (!subject.toLowerCase().startsWith("re:")) {
      subject = `Re: ${subject}`;
    }

    const rawMessage = makeBody(
      emailDoc.originalMessage.sender,
      subject,
      messageBody
    );

    const res = await gmailClient.users.messages.send({
      userId: "me", // 'me' works because gmailClient is already auth'd for the specific user
      requestBody: {
        raw: rawMessage,
        threadId: emailDoc.threadId,
      },
    });
    // console.log(res);

    emailDoc.status = "SENT";
    emailDoc.sentAt = new Date();
    await emailDoc.save();

    console.log(`[EmailService] Sent to ${emailDoc.originalMessage.sender}`);
    return { success: true };
  } catch (error) {
    console.error(`[EmailService] Failed ID ${emailDoc._id}:`, error.message);
    emailDoc.status = "FAILED";
    await emailDoc.save();
    return { success: false, error: error.message };
  }
};
