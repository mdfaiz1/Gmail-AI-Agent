import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { oauth2Client } from "../config/oauthClient.js";
import { encrypt } from "../services/encryption.js";
import axios from "axios";

export const googleLogin = async (req, res) => {
  try {
    const { code } = req.query;
    const response = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(response.tokens);
    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${response.tokens.access_token}`
    );
    const profile = userRes.data;
    let user = await User.findOne({ googleId: profile.sub });
    if (!user) {
      user = await User.create({
        googleId: profile.sub,
        email: profile.email,
        name: profile.name,
        picture: profile.picture || "",
        accessToken: response.tokens.access_token,
        refreshToken: response.tokens.refresh_token
          ? encrypt(response.tokens.refresh_token)
          : undefined,
        tokenExpiry: new Date(response.tokens.expiry_date),
        isSyncActive: false,
      });
    } else {
      user.accessToken = response.tokens.access_token;
      user.tokenExpiry = new Date(response.tokens.expiry_date);
      if (response.tokens.refresh_token) {
        user.refreshToken = encrypt(response.tokens.refresh_token);
      }
      await user.save();
    }
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("gmail_token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(200).json({
      success: true,
      user: user,
      token: jwtToken,
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAuthUser = async (req, res) => {
  try {
    return res.status(200).json({ user: req.user, success: true });
  } catch (error) {
    console.error("Get Auth User Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("gmail_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return res
      .status(200)
      .json({ message: "Logged out successfully", success: true });
  } catch (err) {
    console.log("Logout Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
