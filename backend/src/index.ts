import express from "express";
import cors from "cors";
import helmet from "helmet";

import apiRouter from "./routes/api";

const app = express();

const PORT = Number(
  process.env.PORT || 3001
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: true,
  })
);

app.use(
  express.json({
    limit: "2mb",
  })
);

app.get(
  "/",
  (_req, res) => {
    res.json({
      success: true,
      message: "Backend is working",
    });
  }
);

app.use(
  "/api",
  apiRouter
);

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Backend running on http://localhost:${PORT}`
    );
  }
);