// index.js (Corrected)

import { app } from "./src/app.js";
import { connectDB } from "./src/config/mongoDb.js";
import { redisConnection } from "./src/config/redisConfig.js";
import dotenv from "dotenv";
import { startEmailCron } from "./src/cron/emailCron.js";
import { startGenerateMailCron } from "./src/cron/genarateMailCron.js";
import { startSendMailCron } from "./src/cron/sendMailCron.js";

const tone = "Professional and concise";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    startEmailCron();
    // startGenerateMailCron();
    // startSendMailCron();
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  })
  .catch(error => {
    console.error("❌ Failed to connect to the database:", error);
    process.exit(1);
  });
