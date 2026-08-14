import { Router } from "express";

import {
  analyzeUrl,
  addDownload,
  getJobs,
  getJobController,
  cancelJob,
  progressSSE,
  downloadFile,
  downloadPlaylistFile,
} from "../controllers/downloadController";

const router =
  Router();


router.post(
  "/analyze",
  analyzeUrl
);


router.post(
  "/download",
  addDownload
);


router.get(
  "/downloads",
  getJobs
);


/*
==================================================
FILE ROUTES
==================================================
*/

router.get(
  "/download/:id/file/:filename",
  downloadPlaylistFile
);


router.get(
  "/download/:id/file",
  downloadFile
);


/*
==================================================
JOB
==================================================
*/

router.get(
  "/download/:id",
  getJobController
);


router.post(
  "/download/:id/cancel",
  cancelJob
);


/*
==================================================
PROGRESS
==================================================
*/

router.get(
  "/progress",
  progressSSE
);


export default router;