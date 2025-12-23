import { google } from "googleapis";
import dotenv from "dotenv";
import { scopes } from "../util/gmailScopes.js";

dotenv.config();

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  // process.env.GOOGLE_REDIRECT_URI
  "postmessage"
);

export const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: scopes,
});
