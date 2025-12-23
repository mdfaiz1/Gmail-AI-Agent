import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies.gmail_token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const user = await User.findById(decode.userId).select(
      "-accessToken -refreshToken"
    );
    if (!user) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Protected Route Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
