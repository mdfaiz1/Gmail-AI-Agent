import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRoutes } from "./routes/auth.routes.js";
import { emailRoutes } from "./routes/email.routes.js";
const app = express();
// app.use(cors());

app.use(
  cors({
    origin: "http://localhost:5000", // Allow your frontend
    credentials: true, // Allow cookies to be sent back and forth
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (_, res) => {
  res.send("Hello, World!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/email", emailRoutes);

export { app };
