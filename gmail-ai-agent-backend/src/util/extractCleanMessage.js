export const extractCleanMessage = rawMessage => {
  if (!rawMessage) return "";

  let text = rawMessage;

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p>/gi, "\n")
    .replace(/<\/p>/gi, "\n");

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // Collapse extra newlines
  text = text.replace(/\n{2,}/g, "\n");

  // Trim spaces
  text = text.trim();

  return text;
};
