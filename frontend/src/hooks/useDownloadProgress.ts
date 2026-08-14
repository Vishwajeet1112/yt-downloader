import {
  useEffect,
} from "react";

import {
  getJob,
} from "../services/api";

import type {
  DownloadJob,
} from "../types";

interface Props {
  job: DownloadJob | null;

  onUpdate: (
    job: DownloadJob
  ) => void;
}

export function useDownloadProgress({
  job,
  onUpdate,
}: Props) {
  useEffect(() => {
    if (!job) {
      return;
    }

    const finished =
      job.status ===
        "completed" ||
      job.status ===
        "failed" ||
      job.status ===
        "cancelled";

    if (finished) {
      return;
    }

    const interval =
      setInterval(
        async () => {
          try {
            const updated =
              await getJob(
                job.id
              );

            onUpdate(
              updated
            );
          } catch (error) {
            console.error(
              "Polling error:",
              error
            );
          }
        },
        1000
      );

    return () =>
      clearInterval(
        interval
      );
  }, [
    job?.id,
    job?.status,
    onUpdate,
  ]);
}