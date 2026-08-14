import fs from "fs";
import path from "path";
import { spawn } from "child_process";

import {
  Request,
  Response,
} from "express";

import {
  getJob,
  getAllJobs,
  cancelJob as cancelDownloadJob,
  createJob,
  updateJob,
} from "../services/jobManager";

import {
  startDownload,
} from "../services/ytDlpService";

import type {
  DownloadQuality,
} from "../types";

import {
  isValidUrl,
} from "../utils/validation";


/*
==================================================
ANALYZE URL
==================================================
*/

export const analyzeUrl =
  async (
    req: Request,
    res: Response
  ) => {

    const {
      url,
    } = req.body;


    if (
      !url ||
      typeof url !== "string"
    ) {

      return res.status(400).json({
        error:
          "YouTube URL is required",
      });

    }


    if (
      !isValidUrl(url)
    ) {

      return res.status(400).json({
        error:
          "Invalid URL",
      });

    }


    console.log(
      "Analyzing:",
      url
    );


    const child =
      spawn(
        "yt-dlp",
        [
          "--dump-single-json",
          "--no-download",
          "--no-warnings",
          "--skip-download",
          "--no-playlist",
          "--socket-timeout",
          "20",
          url,
        ],
        {
          windowsHide:
            true,
        }
      );


    let stdout = "";
    let stderr = "";


    const timeout =
      setTimeout(
        () => {

          try {
            child.kill();
          } catch {
            // ignore
          }

        },
        60000
      );


    child.stdout.on(
      "data",
      (
        data
      ) => {

        stdout +=
          data.toString();

      }
    );


    child.stderr.on(
      "data",
      (
        data
      ) => {

        stderr +=
          data.toString();

      }
    );


    child.on(
      "error",
      (
        error
      ) => {

        clearTimeout(
          timeout
        );


        if (
          !res.headersSent
        ) {

          return res.status(500).json({
            error:
              error.message ||
              "Failed to start yt-dlp",
          });

        }

      }
    );


    child.on(
      "close",
      (
        code
      ) => {

        clearTimeout(
          timeout
        );


        if (
          res.headersSent
        ) {
          return;
        }


        if (
          code !== 0
        ) {

          return res.status(500).json({
            error:
              stderr.trim() ||
              `yt-dlp exited with code ${code}`,
          });

        }


        try {

          const info =
            JSON.parse(
              stdout
            );


          return res.json({

            success:
              true,

            id:
              info.id ||
              "",

            title:
              info.title ||
              "Unknown title",

            thumbnail:
              info.thumbnail ||
              "",

            uploader:
              info.uploader ||
              info.channel ||
              "",

            channel:
              info.channel ||
              "",

            channel_url:
              info.channel_url ||
              "",

            duration:
              info.duration ||
              0,

            duration_string:
              info.duration_string ||
              "",

            duration_seconds:
              info.duration ||
              0,

            view_count:
              info.view_count ||
              0,

            upload_date:
              info.upload_date ||
              "",

            webpage_url:
              info.webpage_url ||
              url,

            description:
              info.description ||
              "",

            formats:
              info.formats ||
              [],

          });

        } catch (
          error
        ) {

          console.error(
            "JSON parse error:",
            error
          );


          return res.status(500).json({
            error:
              "Could not parse yt-dlp response",
          });

        }

      }
    );
  };


/*
==================================================
ADD DOWNLOAD
==================================================
*/

export const addDownload =
  (
    req: Request,
    res: Response
  ) => {

    const {
      url,
      options,
    } = req.body;


    if (
      !url ||
      typeof url !== "string"
    ) {

      return res.status(400).json({
        error:
          "YouTube URL is required",
      });

    }


    if (
      !isValidUrl(url)
    ) {

      return res.status(400).json({
        error:
          "Invalid URL",
      });

    }


    const quality =
      (
        options?.quality ||
        "best"
      ) as DownloadQuality;


    const allowedQuality:
      DownloadQuality[] = [
        "best",
        "4k",
        "1080",
        "720",
        "480",
        "360",
        "audio",
      ];


    if (
      !allowedQuality.includes(
        quality
      )
    ) {

      return res.status(400).json({
        error:
          "Invalid quality",
      });

    }


    try {

      /*
      startDownload already creates
      and manages the actual download job.
      */

      const job =
        startDownload(
          url,
          quality
        );


      return res.status(202).json({

        success:
          true,

        job: {
          id:
            job.id,

          url:
            job.url,

          quality:
            job.quality,

          status:
            job.status,

          progress:
            job.progress,

          speed:
            job.speed,

          eta:
            job.eta,

          downloaded:
            job.downloaded,

          total:
            job.total,

          filename:
            job.filename,

          isPlaylist:
            job.isPlaylist,

          totalVideos:
            job.totalVideos,

          completedVideos:
            job.completedVideos,

          skippedVideos:
            job.skippedVideos,

          currentVideo:
            job.currentVideo,

          currentTitle:
            job.currentTitle,

          files:
            job.files,

        },

      });

    } catch (
      error: any
    ) {

      console.error(
        "Start download error:",
        error
      );


      return res.status(500).json({
        error:
          error?.message ||
          "Failed to start download",
      });

    }
  };


/*
==================================================
GET ALL JOBS
==================================================
*/

export const getJobs =
  (
    _req: Request,
    res: Response
  ) => {

    return res.json(
      getAllJobs()
    );

  };


/*
==================================================
GET SINGLE JOB
==================================================
*/

export const getJobController =
  (
    req: Request,
    res: Response
  ) => {

    const job =
      getJob(
        req.params.id
      );


    if (!job) {

      return res.status(404).json({
        error:
          "Job not found",
      });

    }


    return res.json(
      job
    );

  };


/*
==================================================
CANCEL JOB
==================================================
*/

export const cancelJob =
  (
    req: Request,
    res: Response
  ) => {

    const success =
      cancelDownloadJob(
        req.params.id
      );


    if (!success) {

      return res.status(404).json({
        error:
          "Job not found",
      });

    }


    return res.json({

      success:
        true,

      message:
        "Download cancelled",

    });

  };


/*
==================================================
DOWNLOAD COMPLETED SINGLE FILE
==================================================
*/

export const downloadFile =
  (
    req: Request,
    res: Response
  ) => {

    const job =
      getJob(
        req.params.id
      );


    if (!job) {

      return res.status(404).json({
        error:
          "Download job not found",
      });

    }


    if (
      !job.filePath
    ) {

      return res.status(404).json({
        error:
          "Downloaded file path is not available",
      });

    }


    const filePath =
      path.resolve(
        job.filePath
      );


    if (
      !fs.existsSync(
        filePath
      )
    ) {

      return res.status(404).json({
        error:
          "Downloaded file does not exist",
      });

    }


    const filename =
      path.basename(
        filePath
      );


    const stats =
      fs.statSync(
        filePath
      );


    res.setHeader(
      "Content-Type",
      "application/octet-stream"
    );


    res.setHeader(
      "Content-Length",
      stats.size.toString()
    );


    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(
        filename
      )}`
    );


    const stream =
      fs.createReadStream(
        filePath
      );


    stream.on(
      "error",
      (
        error
      ) => {

        console.error(
          "File stream error:",
          error
        );


        if (
          !res.headersSent
        ) {

          res.status(500).json({
            error:
              "Could not read downloaded file",
          });

        }

      }
    );


    stream.pipe(
      res
    );

  };


/*
==================================================
DOWNLOAD PLAYLIST FILE
==================================================
*/

export const downloadPlaylistFile =
  (
    req: Request,
    res: Response
  ) => {

    const job =
      getJob(
        req.params.id
      );


    if (!job) {

      return res.status(404).json({
        error:
          "Download job not found",
      });

    }


    const filename =
      decodeURIComponent(
        req.params.filename
      );


    /*
    Explicit type to fix TS7006
    */

    const file =
      job.files.find(
        (
          item: {
            index: number;
            filename: string;
            filePath: string;
            title: string;
            id: string;
          }
        ) =>
          item.filename ===
          filename
      );


    if (!file) {

      return res.status(404).json({
        error:
          "File not found in this job",
      });

    }


    const filePath =
      path.resolve(
        file.filePath
      );


    if (
      !fs.existsSync(
        filePath
      )
    ) {

      return res.status(404).json({
        error:
          "Physical file does not exist",
      });

    }


    const stats =
      fs.statSync(
        filePath
      );


    res.setHeader(
      "Content-Type",
      "application/octet-stream"
    );


    res.setHeader(
      "Content-Length",
      stats.size.toString()
    );


    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(
        file.filename
      )}`
    );


    const stream =
      fs.createReadStream(
        filePath
      );


    stream.on(
      "error",
      (
        error
      ) => {

        console.error(
          "Playlist file stream error:",
          error
        );


        if (
          !res.headersSent
        ) {

          res.status(500).json({
            error:
              "Could not read playlist file",
          });

        }

      }
    );


    stream.pipe(
      res
    );

  };


/*
==================================================
PROGRESS SSE
==================================================
*/

export const progressSSE =
  (
    _req: Request,
    res: Response
  ) => {

    res.setHeader(
      "Content-Type",
      "text/event-stream"
    );

    res.setHeader(
      "Cache-Control",
      "no-cache"
    );

    res.setHeader(
      "Connection",
      "keep-alive"
    );


    if (
      typeof (
        res as any
      ).flushHeaders ===
      "function"
    ) {

      (
        res as any
      ).flushHeaders();

    }


    /*
    Since the current jobManager does not
    have EventEmitter, use polling SSE.
    */

    const sendJobs =
      () => {

        try {

          res.write(
            `data: ${JSON.stringify({
              type:
                "jobs",

              jobs:
                getAllJobs(),
            })}\n\n`
          );

        } catch {
          // client disconnected
        }

      };


    sendJobs();


    const interval =
      setInterval(
        sendJobs,
        1000
      );


    _req.on(
      "close",
      () => {

        clearInterval(
          interval
        );

      }
    );

  };