import { randomUUID } from "crypto";

import type {
  DownloadJob,
  DownloadQuality,
} from "../types";

const jobs =
  new Map<string, DownloadJob>();

/*
==================================================
CREATE JOB
==================================================
*/

export function createJob(
  url: string,
  quality: DownloadQuality
): DownloadJob {
  const job: DownloadJob = {
    id: randomUUID(),

    url,

    quality,

    status: "queued",

    progress: 0,

    speed: "—",

    eta: "—",

    downloaded: "0 B",

    total: "—",

    filename: "",

    filePath: undefined,

    error: undefined,

    process: undefined,

    /*
    Playlist
    */

    isPlaylist: false,

    totalVideos: 0,

    completedVideos: 0,

    skippedVideos: 0,

    currentVideo: 0,

    currentTitle: "",

    files: [],
  };

  jobs.set(
    job.id,
    job
  );

  return job;
}

/*
==================================================
GET JOB
==================================================
*/

export function getJob(
  id: string
): DownloadJob | undefined {
  return jobs.get(id);
}

/*
==================================================
UPDATE JOB
==================================================
*/

export function updateJob(
  id: string,
  updates: Partial<DownloadJob>
): void {
  const job =
    jobs.get(id);

  if (!job) {
    return;
  }

  Object.assign(
    job,
    updates
  );

  jobs.set(
    id,
    job
  );
}

/*
==================================================
ADD FILE
==================================================
*/

export function addJobFile(
  id: string,
  file: DownloadJob["files"][number]
): void {
  const job =
    jobs.get(id);

  if (!job) {
    return;
  }

  job.files.push(
    file
  );

  jobs.set(
    id,
    job
  );
}

/*
==================================================
GET ALL JOBS
==================================================
*/

export function getAllJobs(): DownloadJob[] {
  return Array.from(
    jobs.values()
  ).map(
    ({
      process,
      ...job
    }) => job
  );
}

/*
==================================================
CANCEL JOB
==================================================
*/

export function cancelJob(
  id: string
): boolean {
  const job =
    jobs.get(id);

  if (!job) {
    return false;
  }

  if (job.process) {
    try {
      job.process.kill();
    } catch {
      // ignore
    }
  }

  job.status =
    "cancelled";

  jobs.set(
    id,
    job
  );

  return true;
}
