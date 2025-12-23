import { Router } from "express";
import {
  toggleAutoSync,
  fetchEmails,
  getEmailDetails,
  sendingMail,
  regenarateEmail,
  cancelEmail,
} from "../controllers/email.controller.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";
const router = Router();

router.use(protectedRoute);
router.post("/toggleIsSync/:userId", toggleAutoSync);
router.get("/", fetchEmails);
router.get("/:emailId", getEmailDetails);
router.put("/sendMail/:emailId", sendingMail);
router.put("/regenerateEmail/:emailId", regenarateEmail);
router.put("/cancelEmail/:emailId", cancelEmail);

export { router as emailRoutes };
