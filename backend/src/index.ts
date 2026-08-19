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

const allowedOrigins = new Set([
  "https://yt-downloader-1mpy.vercel.app",
  "https://yt-downloader-production-0b18.up.railway.app",
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,DELETE,OPTIONS"
  );

  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cache-Control, Pragma, Accept"
  );

  res.header("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

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
