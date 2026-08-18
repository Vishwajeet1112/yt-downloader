import { spawn } from "child_process";
import fs from "fs";
import path from "path";

import {
  createJob,
  updateJob,
  getJob,
  addJobFile,
} from "./jobManager";

import type {
  DownloadQuality,
  DownloadJob,
} from "../types";


/*
==================================================
DOWNLOAD DIRECTORY
==================================================
*/

const DOWNLOAD_DIR = path.resolve(
  process.cwd(),
  "../downloads"
);

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, {
    recursive: true,
  });
}


/*
==================================================
QUALITY
==================================================
*/

function getFormat(
  quality: DownloadQuality
): string {

  switch (quality) {

    case "4k":
      return "bestvideo[height<=2160]+bestaudio/best[height<=2160]/best[height<=2160]/best";

    case "1080":
      return "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best[height<=1080]/best";

    case "720":
      return "bestvideo[height<=720]+bestaudio/best[height<=720]/best[height<=720]/best";

    case "480":
      return "bestvideo[height<=480]+bestaudio/best[height<=480]/best[height<=480]/best";

    case "360":
      return "bestvideo[height<=360]+bestaudio/best[height<=360]/best[height<=360]/best";

    case "audio":
      return "bestaudio/best";

    case "best":
    default:
      return "bestvideo*+bestaudio/best";
  }
}


/*
==================================================
YT-DLP COMMON OPTIONS
==================================================
*/

function getYtDlpCommonArgs(): string[] {
  return [
    "--newline",
    "--progress",
    "--no-warnings",
    "--no-playlist",
    "--js-runtimes",
    "deno",
    "--remote-components",
    "ejs:github",
    "--force-ipv4",
    "--retries",
    "3",
    "--fragment-retries",
    "3",
  ];
}


/*
==================================================
NORMALIZE TITLE
==================================================
*/

function normalizeTitle(
  title: string
): string {

  return title
    .toLowerCase()

    .replace(
      /https?:\/\/\S+/gi,
      ""
    )

    .replace(
      /\[(official|video|audio|hd|4k|1080p|720p|lyrics?|lyric video)\]/gi,
      ""
    )

    .replace(
      /\((official|video|audio|hd|4k|1080p|720p|lyrics?|lyric video)\)/gi,
      ""
    )

    .replace(
      /[_\-|]+/g,
      " "
    )

    .replace(
      /[^\p{L}\p{N}\s]/gu,
      ""
    )

    .replace(
      /\s+/g,
      " "
    )

    .trim();
}


/*
==================================================
TEMP FILE CLEANUP
==================================================
*/

function cleanupTempFiles(
  directory: string
): void {

  if (!fs.existsSync(directory)) {
    return;
  }

  try {

    const files =
      fs.readdirSync(directory);

    for (const file of files) {

      const filePath =
        path.join(
          directory,
          file
        );

      try {

        const stat =
          fs.statSync(
            filePath
          );

        if (stat.isDirectory()) {
          continue;
        }

        const isTemp =
          file.endsWith(".part") ||
          file.endsWith(".ytdl") ||
          file.endsWith(".tmp") ||
          file.includes(".part-Frag") ||
          file.includes(".part");

        if (isTemp) {

          fs.rmSync(
            filePath,
            {
              force: true,
            }
          );

          console.log(
            "Deleted temporary file:",
            file
          );
        }

      } catch {
        // Ignore individual cleanup errors
      }
    }

  } catch (error) {

    console.error(
      "Temp cleanup error:",
      error
    );
  }
}


/*
==================================================
PLAYLIST ENTRY
==================================================
*/

interface PlaylistEntry {

  id: string;

  title: string;

  url: string;

  index: number;
}


/*
==================================================
PLAYLIST RESULT
==================================================
*/

interface PlaylistResult {

  videos: PlaylistEntry[];

  originalCount: number;

  skippedCount: number;
}


/*
==================================================
GET PLAYLIST INFORMATION
==================================================
*/

function getPlaylistEntries(
  url: string
): Promise<PlaylistResult> {

  return new Promise(
    (resolve, reject) => {

      const child =
        spawn(
          "yt-dlp",
          [
            "--flat-playlist",
            "--dump-single-json",
            "--no-download",
            "--yes-playlist",
            "--js-runtimes",
            "deno",
            "--remote-components",
            "ejs:github",
            "--force-ipv4",
            "--socket-timeout",
            "30",
            url,
          ],
          {
            windowsHide: true,
          }
        );


      let stdout = "";

      let stderr = "";


      child.stdout.on(
        "data",
        (data: Buffer) => {

          stdout +=
            data.toString();

        }
      );


      child.stderr.on(
        "data",
        (data: Buffer) => {

          stderr +=
            data.toString();

        }
      );


      child.on(
        "error",
        (error) => {

          reject(error);

        }
      );


      child.on(
        "close",
        (code) => {

          if (code !== 0) {

            reject(
              new Error(
                stderr.trim() ||
                "Could not analyze playlist"
              )
            );

            return;
          }


          try {

            const info =
              JSON.parse(
                stdout
              );


            const entries =
              Array.isArray(
                info.entries
              )
                ? info.entries
                : [];


            const result:
              PlaylistEntry[] = [];


            const seenIds =
              new Set<string>();


            const seenTitles =
              new Set<string>();


            let skippedCount =
              0;


            for (
              let i = 0;
              i < entries.length;
              i++
            ) {

              const item =
                entries[i];


              if (!item) {
                continue;
              }


              const id =
                String(
                  item.id || ""
                ).trim();


              const title =
                String(
                  item.title || ""
                ).trim();


              if (!id && !title) {
                continue;
              }


              /*
              ==========================================
              VIDEO URL
              ==========================================
              */

              const videoUrl =
                item.webpage_url ||
                item.url ||
                (
                  id
                    ? `https://www.youtube.com/watch?v=${id}`
                    : ""
                );


              if (!videoUrl) {
                continue;
              }


              /*
              ==========================================
              NORMALIZED TITLE
              ==========================================
              */

              const normalized =
                normalizeTitle(
                  title
                );


              /*
              ==========================================
              DUPLICATE ID
              ==========================================
              */

              if (
                id &&
                seenIds.has(id)
              ) {

                skippedCount++;

                console.log(
                  `SKIP DUPLICATE ID: ${title} (${id})`
                );

                continue;
              }


              /*
              ==========================================
              DUPLICATE TITLE
              ==========================================
              */

              if (
                normalized &&
                seenTitles.has(
                  normalized
                )
              ) {

                skippedCount++;

                console.log(
                  `SKIP DUPLICATE TITLE: ${title}`
                );

                continue;
              }


              /*
              ==========================================
              ADD UNIQUE VIDEO
              ==========================================
              */

              if (id) {
                seenIds.add(id);
              }


              if (normalized) {
                seenTitles.add(
                  normalized
                );
              }


              result.push({

                id,

                title:
                  title ||
                  `Video ${i + 1}`,

                url:
                  videoUrl,

                index:
                  result.length + 1,

              });
            }


            console.log(
              "================================"
            );

            console.log(
              "PLAYLIST FILTER"
            );

            console.log(
              "Original videos:",
              entries.length
            );

            console.log(
              "Unique videos:",
              result.length
            );

            console.log(
              "Duplicates skipped:",
              skippedCount
            );

            console.log(
              "================================"
            );


            resolve({

              videos:
                result,

              originalCount:
                entries.length,

              skippedCount,

            });

          } catch {

            reject(
              new Error(
                "Could not parse playlist information"
              )
            );
          }
        }
      );
    }
  );
}


/*
==================================================
PARSE DOWNLOAD PROGRESS
==================================================
*/

function parseProgress(
  line: string,
  jobId: string,
  playlistIndex?: number,
  totalVideos?: number
): void {

  const progressMatch =
    line.match(
      /(\d+(?:\.\d+)?)%/
    );


  const speedMatch =
    line.match(
      /at\s+([^\s]+\/s)/
    );


  const etaMatch =
    line.match(
      /ETA\s+([0-9:]+)/
    );


  /*
  ==============================================
  PROGRESS
  ==============================================
  */

  if (progressMatch) {

    const currentProgress =
      Number(
        progressMatch[1]
      );


    /*
    Playlist overall progress
    */

    if (
      playlistIndex &&
      totalVideos
    ) {

      const overall =
        (
          (
            playlistIndex - 1
          ) +
          currentProgress /
          100
        ) /
        totalVideos;


      updateJob(
        jobId,
        {

          progress:
            Math.min(
              99.9,
              overall * 100
            ),

          currentVideo:
            playlistIndex,

        }
      );

    } else {

      updateJob(
        jobId,
        {
          progress:
            currentProgress,
        }
      );
    }
  }


  /*
  ==============================================
  SPEED
  ==============================================
  */

  if (speedMatch) {

    updateJob(
      jobId,
      {
        speed:
          speedMatch[1],
      }
    );
  }


  /*
  ==============================================
  ETA
  ==============================================
  */

  if (etaMatch) {

    updateJob(
      jobId,
      {
        eta:
          etaMatch[1],
      }
    );
  }
}


/*
==================================================
GET VIDEO ID FROM URL
==================================================
*/

function getVideoIdFromUrl(
  url: string
): string {

  const match =
    url.match(
      /(?:v=|youtu\.be\/|shorts\/)([^&?/]+)/
    );


  return (
    match?.[1] ||
    `single-${Date.now()}`
  );
}


/*
==================================================
FIND FINAL FILE
==================================================
*/

function findDownloadedFile(
  video: PlaylistEntry
): string | undefined {

  if (
    !fs.existsSync(
      DOWNLOAD_DIR
    )
  ) {
    return undefined;
  }


  const files =
    fs
      .readdirSync(
        DOWNLOAD_DIR
      )
      .filter(
        (file) => {

          /*
          Ignore temporary files
          */

          if (
            file.endsWith(".part") ||
            file.endsWith(".ytdl") ||
            file.endsWith(".tmp")
          ) {
            return false;
          }


          /*
          Playlist / video ID
          */

          if (
            video.id &&
            file.includes(
              `[${video.id}]`
            )
          ) {
            return true;
          }


          return false;
        }
      );


  if (
    files.length === 0
  ) {
    return undefined;
  }


  return files[
    files.length - 1
  ];
}


/*
==================================================
DOWNLOAD SINGLE VIDEO
==================================================
*/

function downloadSingleVideo(
  video: PlaylistEntry,
  quality: DownloadQuality,
  jobId: string,
  playlistIndex?: number,
  totalVideos?: number
): Promise<{
  success: boolean;
  filename?: string;
  error?: string;
}> {

  return new Promise(
    (resolve) => {

      /*
      ============================================
      OUTPUT TEMPLATE
      ============================================
      */

      const outputTemplate =
        path.join(
          DOWNLOAD_DIR,

          `${String(
            video.index
          ).padStart(
            3,
            "0"
          )} - %(title)s [%(id)s].%(ext)s`
        );


      let args: string[];


      /*
      ============================================
      AUDIO
      ============================================
      */

      if (
        quality === "audio"
      ) {

        args = [
          ...getYtDlpCommonArgs(),
          "-x",
          "--audio-format",
          "mp3",
          "-o",
          outputTemplate,
          video.url,
        ];

      } else {

        /*
        ==========================================
        VIDEO + AUDIO
        ==========================================
        */

        args = [
          ...getYtDlpCommonArgs(),
          "-f",
          getFormat(
            quality
          ),
          "--merge-output-format",
          "mp4",
          "-o",
          outputTemplate,
          video.url,
        ];
      }


      console.log(
        `Downloading ${video.index}: ${video.title}`
      );


      const child =
        spawn(
          "yt-dlp",
          args,
          {
            windowsHide:
              true,

            cwd:
              DOWNLOAD_DIR,
          }
        );


      let stderr = "";


      /*
      ==========================================
      STORE PROCESS
      ==========================================
      */

      updateJob(
        jobId,
        {
          process:
            child,
        }
      );


      /*
      ==========================================
      STDOUT
      ==========================================
      */

      child.stdout.on(
        "data",
        (data: Buffer) => {

          const text =
            data.toString();

          console.log(
            text
          );


          const lines =
            text.split(
              /\r?\n/
            );


          for (
            const line of lines
          ) {

            parseProgress(
              line,
              jobId,
              playlistIndex,
              totalVideos
            );
          }
        }
      );


      /*
      ==========================================
      STDERR
      ==========================================
      */

      child.stderr.on(
        "data",
        (data: Buffer) => {

          const text =
            data.toString();

          stderr +=
            text;


          const lines =
            text.split(
              /\r?\n/
            );


          for (
            const line of lines
          ) {

            parseProgress(
              line,
              jobId,
              playlistIndex,
              totalVideos
            );
          }
        }
      );


      /*
      ==========================================
      PROCESS ERROR
      ==========================================
      */

      child.on(
        "error",
        (error) => {

          cleanupTempFiles(
            DOWNLOAD_DIR
          );


          updateJob(
            jobId,
            {
              process:
                undefined,
            }
          );


          resolve({

            success:
              false,

            error:
              error.message,

          });
        }
      );


      /*
      ==========================================
      PROCESS CLOSE
      ==========================================
      */

      child.on(
        "close",
        (code) => {

          cleanupTempFiles(
            DOWNLOAD_DIR
          );


          /*
          ========================================
          ERROR
          ========================================
          */

          if (
            code !== 0
          ) {

            updateJob(
              jobId,
              {
                process:
                  undefined,
              }
            );


            resolve({

              success:
                false,

              error:
                stderr.trim() ||
                `yt-dlp exited with code ${code}`,

            });

            return;
          }


          /*
          ========================================
          FIND FINAL FILE
          ========================================
          */

          const filename =
            findDownloadedFile(
              video
            );


          if (!filename) {

            updateJob(
              jobId,
              {
                process:
                  undefined,
              }
            );


            resolve({

              success:
                false,

              error:
                "Final downloaded file was not found.",

            });

            return;
          }


          /*
          ========================================
          FILE PATH
          ========================================
          */

          const filePath =
            path.join(
              DOWNLOAD_DIR,
              filename
            );


          console.log(
            `Completed: ${filename}`
          );


          /*
          ========================================
          ADD FILE TO JOB
          ========================================
          */

          addJobFile(
            jobId,
            {

              index:
                video.index,

              filename,

              filePath,

              title:
                video.title,

              id:
                video.id,

            }
          );


          updateJob(
            jobId,
            {
              process:
                undefined,

              filename,

              filePath,

              currentTitle:
                video.title,

            }
          );


          resolve({

            success:
              true,

            filename,

          });
        }
      );
    }
  );
}


/*
==================================================
START DOWNLOAD
==================================================
*/

export function startDownload(
  url: string,
  quality: DownloadQuality
): DownloadJob {

  /*
  ==============================================
  CREATE JOB
  ==============================================
  */

  const job =
    createJob(
      url,
      quality
    );


  /*
  ==============================================
  ASYNC DOWNLOAD
  ==============================================
  */

  setImmediate(
    async () => {

      try {

        /*
        ========================================
        CHECK PLAYLIST
        ========================================
        */

        const isPlaylist =
          url.includes(
            "list="
          ) ||
          url.includes(
            "/playlist"
          );


        /*
        ========================================
        SINGLE VIDEO
        ========================================
        */

        if (!isPlaylist) {

          const videoId =
            getVideoIdFromUrl(
              url
            );


          const video:
            PlaylistEntry = {

              id:
                videoId,

              title:
                "Video",

              url,

              index:
                1,

            };


          updateJob(
            job.id,
            {

              status:
                "downloading",

              isPlaylist:
                false,

              totalVideos:
                1,

              currentVideo:
                1,

              currentTitle:
                "Video",

            }
          );


          const result =
            await downloadSingleVideo(
              video,
              quality,
              job.id
            );


          /*
          ======================================
          FAILED
          ======================================
          */

          if (
            !result.success
          ) {

            updateJob(
              job.id,
              {

                status:
                  "failed",

                error:
                  result.error ||
                  "Download failed",

                process:
                  undefined,

              }
            );

            return;
          }


          /*
          ======================================
          COMPLETED
          ======================================
          */

          updateJob(
            job.id,
            {

              status:
                "completed",

              progress:
                100,

              completedVideos:
                1,

              totalVideos:
                1,

              currentVideo:
                1,

              speed:
                "—",

              eta:
                "00:00",

              filename:
                result.filename ||
                "",

              filePath:
                result.filename
                  ? path.join(
                      DOWNLOAD_DIR,
                      result.filename
                    )
                  : undefined,

              process:
                undefined,

            }
          );


          return;
        }


        /*
        ========================================
        PLAYLIST
        ========================================
        */

        updateJob(
          job.id,
          {

            status:
              "analyzing",

            isPlaylist:
              true,

            progress:
              0,

          }
        );


        console.log(
          "Analyzing playlist for duplicates..."
        );


        const playlist =
          await getPlaylistEntries(
            url
          );


        const videos =
          playlist.videos;


        /*
        ========================================
        NO VIDEOS
        ========================================
        */

        if (
          videos.length === 0
        ) {

          updateJob(
            job.id,
            {

              status:
                "failed",

              error:
                "No unique videos found in playlist.",

              process:
                undefined,

            }
          );

          return;
        }


        /*
        ========================================
        PLAYLIST JOB INFO
        ========================================
        */

        updateJob(
          job.id,
          {

            status:
              "downloading",

            isPlaylist:
              true,

            totalVideos:
              videos.length,

            completedVideos:
              0,

            skippedVideos:
              playlist.skippedCount,

            currentVideo:
              0,

            currentTitle:
              "",

            process:
              undefined,

          }
        );


        console.log(
          `Starting playlist download: ${videos.length} unique videos`
        );

        console.log(
          `Skipped duplicates: ${playlist.skippedCount}`
        );


        let completed =
          0;


        const downloadedFiles:
          string[] = [];


        /*
        ========================================
        DOWNLOAD EACH UNIQUE VIDEO
        ========================================
        */

        for (
          let i = 0;
          i < videos.length;
          i++
        ) {

          const current =
            videos[i];


          /*
          ======================================
          CHECK CANCEL
          ======================================
          */

          const currentJob =
            getJob(
              job.id
            );


          if (
            !currentJob ||
            currentJob.status ===
              "cancelled"
          ) {

            cleanupTempFiles(
              DOWNLOAD_DIR
            );

            return;
          }


          /*
          ======================================
          CURRENT VIDEO
          ======================================
          */

          updateJob(
            job.id,
            {

              currentVideo:
                i + 1,

              currentTitle:
                current.title,

              progress:
                (
                  i /
                  videos.length
                ) *
                100,

            }
          );


          console.log(
            "================================"
          );

          console.log(
            `Playlist: ${i + 1}/${videos.length}`
          );

          console.log(
            `Title: ${current.title}`
          );

          console.log(
            "================================"
          );


          /*
          ======================================
          DOWNLOAD
          ======================================
          */

          const result =
            await downloadSingleVideo(
              current,
              quality,
              job.id,
              i + 1,
              videos.length
            );


          /*
          ======================================
          FAILED VIDEO
          ======================================
          */

          if (
            !result.success
          ) {

            console.error(
              `Failed video ${i + 1}:`,
              result.error
            );

            /*
            Continue to next video
            */

            continue;
          }


          /*
          ======================================
          COMPLETED VIDEO
          ======================================
          */

          completed++;


          if (
            result.filename
          ) {

            downloadedFiles.push(
              result.filename
            );
          }


          /*
          ======================================
          UPDATE JOB
          ======================================
          */

          updateJob(
            job.id,
            {

              completedVideos:
                completed,

              progress:
                (
                  completed /
                  videos.length
                ) *
                100,

            }
          );
        }


        /*
        ========================================
        CLEAN TEMP FILES
        ========================================
        */

        cleanupTempFiles(
          DOWNLOAD_DIR
        );


        /*
        ========================================
        NO SUCCESSFUL DOWNLOAD
        ========================================
        */

        if (
          completed === 0
        ) {

          updateJob(
            job.id,
            {

              status:
                "failed",

              error:
                "No videos could be downloaded.",

              process:
                undefined,

            }
          );

          return;
        }


        /*
        ========================================
        PLAYLIST COMPLETE
        ========================================
        */

        const lastFilename =
          downloadedFiles[
            downloadedFiles.length - 1
          ] || "";


        updateJob(
          job.id,
          {

            status:
              "completed",

            progress:
              100,

            completedVideos:
              completed,

            totalVideos:
              videos.length,

            speed:
              "—",

            eta:
              "00:00",

            filename:
              lastFilename,

            filePath:
              lastFilename
                ? path.join(
                    DOWNLOAD_DIR,
                    lastFilename
                  )
                : undefined,

            process:
              undefined,

          }
        );


        console.log(
          "================================"
        );

        console.log(
          "PLAYLIST DOWNLOAD COMPLETE"
        );

        console.log(
          `Completed: ${completed}/${videos.length}`
        );

        console.log(
          `Duplicates skipped: ${playlist.skippedCount}`
        );

        console.log(
          "================================"
        );

      } catch (
        error: any
      ) {

        console.error(
          "Download error:",
          error
        );


        cleanupTempFiles(
          DOWNLOAD_DIR
        );


        updateJob(
          job.id,
          {

            status:
              "failed",

            error:
              error?.message ||
              "Download failed",

            process:
              undefined,

          }
        );
      }
    }
  );


  return job;
}