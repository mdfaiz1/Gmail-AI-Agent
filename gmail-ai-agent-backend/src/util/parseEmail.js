import { Buffer } from "buffer"; // Node.js only

export const parseEmail = email => {
  const headers = email.payload.headers || [];

  // Helper to get header value
  const getHeader = name => {
    const h = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return h ? h.value : null;
  };

  // Extract email body: HTML preferred, fallback to plain text
  const extractBody = payload => {
    if (!payload) return "";

    // Multi-part emails
    if (payload.parts && payload.parts.length) {
      const htmlPart = payload.parts.find(
        p => p.mimeType === "text/html" && p.body?.data
      );
      if (htmlPart) {
        return Buffer.from(htmlPart.body.data, "base64").toString("utf-8");
      }

      const plainPart = payload.parts.find(
        p => p.mimeType === "text/plain" && p.body?.data
      );
      if (plainPart) {
        return Buffer.from(plainPart.body.data, "base64").toString("utf-8");
      }
    }

    // Single-part email
    if (payload.body?.data) {
      return Buffer.from(payload.body.data, "base64").toString("utf-8");
    }

    return "";
  };

  return {
    threadId: email.threadId || null,
    messageId: getHeader("Message-ID"),
    sender: getHeader("From"),
    to: getHeader("To"),
    cc: getHeader("Cc"),
    bcc: getHeader("Bcc"),
    replyTo: getHeader("Reply-To"),
    subject: getHeader("Subject"),
    date: getHeader("Date"),
    snippet: extractBody(email.payload),
  };
};
