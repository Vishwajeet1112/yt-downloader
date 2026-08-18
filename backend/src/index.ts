import express from "express";
import cors from "cors";
import helmet from "helmet";

import apiRouter from "./routes/api";

const app = express();

const PORT = Number(
  process.env.PORT || 3001
);

/*
==================================================
SECURITY
==================================================
*/

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/*
==================================================
CORS
==================================================

The frontend is hosted on Vercel while this API is
hosted on Railway. Allow browser requests from any
origin because this is a public downloader API and
we do not use cookie-based authentication.
*/

app.use(
  cors({
    origin: "*",
    methods: [
      "GET",
      "POST",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
    optionsSuccessStatus: 204,
  })
);

app.use(
  express.json({
    limit: "2mb",
  })
);

/*
==================================================
HEALTH CHECK
==================================================
*/

app.get(
  "/",
  (_req, res) => {
    res.json({
      success: true,
      message: "Backend is working",
    });
  }
);

app.get(
  "/health",
  (_req, res) => {
    res.json({
      success: true,
      service: "yt-downloader-backend",
      status: "healthy",
    });
  }
);

/*
==================================================
API ROUTES
==================================================
*/

app.use(
  "/api",
  apiRouter
);

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Backend running on http://0.0.0.0:${PORT}`
    );
  }
);
