import cron from "node-cron";
import { User } from "../models/user.model.js";
import { fetchEmailsService } from "../services/gmailService.js";

// Configuration
const BATCH_SIZE = 5;
const LOCK_TIME = 1 * 60 * 1000; // 10 Minutes

export const startEmailCron = () => {
  // Run every 5 seconds
  cron.schedule("*/10 * * * * *", async () => {
    const now = new Date();
    const lockExpiry = new Date(now.getTime() + LOCK_TIME);

    try {
      // 1. Find Candidates (Queue System)
      // Logic: Find ANY user who is not currently locked.
      // The .sort() ensures we pick the ones who haven't been updated in the longest time.
      const candidates = await User.find({
        isSyncActive: true,
        $or: [
          { fetchLockUntil: { $exists: false } },
          { fetchLockUntil: null },
          { fetchLockUntil: { $lte: now } }, // Lock expired
        ],
        refreshToken: { $exists: true },
      })
        .sort({ lastEmailFetch: 1 }) // Oldest fetch date (or null) comes first
        .limit(BATCH_SIZE)
        .select("_id");

      if (candidates.length === 0) return;

      console.log(`[Cron] Selected ${candidates.length} users for processing.`);

      // 2. Lock & Process Loop
      for (const candidate of candidates) {
        // Atomic Lock
        const user = await User.findOneAndUpdate(
          {
            _id: candidate._id,
            isSyncActive: true,
            $or: [{ fetchLockUntil: { $lte: now } }, { fetchLockUntil: null }],
          },
          { $set: { fetchLockUntil: lockExpiry } },
          { new: true }
        );

        if (!user) continue;

        // 3. Run Service (Fire & Forget)
        fetchEmailsService(user._id)
          .then(async () => {
            // Success: Update timestamp & Unlock
            // This pushes them to the bottom of the sort queue
            await User.updateOne(
              { _id: user._id },
              { $set: { lastEmailFetch: new Date(), fetchLockUntil: null } }
            );
          })
          .catch(async err => {
            console.error(`[Cron] User ${user._id} failed:`, err.message);
            // Failure: Unlock immediately so they can be retried or picked up later
            await User.updateOne(
              { _id: user._id },
              { $set: { fetchLockUntil: null } }
            );
          });
      }
    } catch (error) {
      console.error("[Cron] Critical Error:", error);
    }
  });

  console.log("Scalable Cron Job Initialized (Continuous Queue).");
};
