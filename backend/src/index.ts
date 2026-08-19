import express from "express";
import cors from "cors";
import helmet from "helmet";

import apiRouter from "./routes/api";

const app = express();

const PORT = Number(process.env.PORT || 3001);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Frontend is hosted on Vercel and API is hosted on Railway.
// Keep CORS explicit and allow the headers used by the frontend.
app.use(
  cors({
    origin: [
      "https://yt-downloader-1mpy.vercel.app",
      "https://yt-downloader-production-0b18.up.railway.app",
    ],
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Pragma",
      "Accept",
    ],
    credentials: false,
    optionsSuccessStatus: 204,
    maxAge: 86400,
  })
);

app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Backend is working",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "yt-downloader-backend",
    status: "healthy",
  });
});

app.use("/api", apiRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});
