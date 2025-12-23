import { Router } from "express";
import {
  googleLogin,
  getAuthUser,
  logout,
} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/google/login", googleLogin);
router.post("/logout", logout);
router.get("/user", protectedRoute, getAuthUser);

export { router as authRoutes };
