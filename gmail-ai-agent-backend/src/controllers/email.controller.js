import { User } from "../models/user.model.js";
import { EmailThread } from "../models/emailLog.model.js";

export const toggleAutoSync = async (req, res) => {
  try {
    const { enable } = req.query;
    const { userId } = req.params;
    // console.log("Toggle Auto-Sync Request:", { userId, enable });

    // 1. Validation
    if (!userId || !enable) {
      return res.status(400).json({
        success: false,
        error: "userId and enable (boolean) are required.",
      });
    }

    // 2. Find and Update in one step
    // { new: true } returns the updated document so we can confirm the change
    const user = await User.findByIdAndUpdate(
      userId,
      { isSyncActive: enable },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: enable
        ? "Auto-Sync Enabled. Emails will be fetched in the background."
        : "Auto-Sync Disabled. Background fetching stopped.",
      isSyncActive: user.isSyncActive,
    });
  } catch (error) {
    console.error("Settings Error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const fetchEmails = async (req, res) => {
  try {
    const { page, limit } = req.query;
    // console.log(req.user);
    const { _id: userId } = req.user;
    // console.log(userId);
    // console.log(page);
    // console.log(limit);
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "userId is required." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const skip = (page - 1) * limit;
    const emails = await EmailThread.find({
      userId: user._id,
      // status: "DRAFT_GENERATED",
    }) // Adjust field name if it's 'user' or 'sender'
      .sort({ createdAt: -1 }) // Sorts by newest emails first
      .skip(skip)
      .limit(limit);
    const totalEmails = await EmailThread.countDocuments({ userId: user._id });
    res.status(200).json({
      success: true,
      data: emails,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalEmails / limit),
        totalEmails: totalEmails,
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Fetch Emails Error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const getEmailDetails = async (req, res) => {
  try {
    const { emailId } = req.params;

    if (!emailId) {
      return res
        .status(400)
        .json({ success: false, error: "emailId is required." });
    }
    const email = await EmailThread.findById(emailId);
    if (!email) {
      return res.status(404).json({ success: false, error: "Email not found" });
    }
    res.status(200).json({ success: true, data: email });
  } catch (error) {
    console.error("Get Email Details Error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const sendingMail = async (req, res) => {
  try {
    const { emailId } = req.params;
    console.log("Sending Mail Request for emailId:", emailId);
    // const { newStatus } = req.body;
    // console.log("New Status:", newStatus);
    const newStatus = "SENDING";

    if (!emailId) {
      return res
        .status(400)
        .json({ success: false, error: "emailId is required." });
    }
    const email = await EmailThread.findByIdAndUpdate(
      emailId,
      { status: "SENDING" },
      { new: true }
    );
    if (!email) {
      return res.status(404).json({ success: false, error: "Email not found" });
    }
    res.status(200).json({ success: true, data: email });
  } catch (error) {
    console.error("Get Email Details Error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const regenarateEmail = async (req, res) => {
  try {
    const { emailId } = req.params;
    if (!emailId) {
      return res
        .status(400)
        .json({ success: false, error: "emailId is required." });
    }
    const { newData } = req.body;
    const email = await EmailThread.findByIdAndUpdate(
      emailId,
      {
        generatedReply: {
          message: newData.newMsg,
          subject: newData.subject,
        },
        status: newData.newStatus,
      },
      { new: true }
    );
    if (!email) {
      return res.status(404).json({ success: false, error: "Email not found" });
    }
    res.status(200).json({ success: true, data: email });
  } catch (error) {
    console.error("Regenerate Email Error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const cancelEmail = async (req, res) => {
  try {
    const { emailId } = req.params;
    const { status: newStatus } = req.body;
    if (!emailId) {
      return res
        .status(404)
        .json({ success: false, message: "Email's ID Not Found" });
    }
    if (!newStatus) {
      return res
        .status(404)
        .json({ status: false, message: "New Status is Not Available" });
    }
    const existEmail = await EmailThread.findByIdAndUpdate(
      emailId,
      {
        status: newStatus,
      },
      {
        new: true,
      }
    );
    if (!existEmail) {
      return res
        .status(400)
        .json({ status: false, message: "Email Not Found" });
    }
    return res
      .status(200)
      .json({ status: true, message: "Email Status Change Successfully" });
  } catch (error) {
    console.error("Error in cancel", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
