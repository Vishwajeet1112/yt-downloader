export type DownloadQuality =
  | "best"
  | "4k"
  | "1080"
  | "720"
  | "480"
  | "360"
  | "audio";


export type JobStatus =
  | "queued"
  | "analyzing"
  | "downloading"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";


/*
==================================================
DOWNLOAD OPTIONS
==================================================
*/

export interface DownloadOptions {
  quality?: DownloadQuality;

  savePath?: string;

  outputDir?: string;

  formatId?: string;

  isPlaylist?: boolean;
}


/*
==================================================
DOWNLOADED FILE
==================================================
*/

export interface DownloadedFile {

  index: number;

  filename: string;

  filePath: string;

  title: string;

  id: string;
}


/*
==================================================
DOWNLOAD JOB
==================================================
*/

export interface DownloadJob {

  id: string;

  url: string;

  quality: DownloadQuality;

  status: JobStatus;

  progress: number;

  speed: string;

  eta: string;

  downloaded: string;

  total: string;

  filename: string;

  filePath?: string;

  error?: string;

  process?: any;


  /*
  ==============================================
  PLAYLIST DATA
  ==============================================
  */

  isPlaylist?: boolean;

  totalVideos: number;

  completedVideos: number;

  skippedVideos: number;

  currentVideo: number;

  currentTitle: string;

  files: DownloadedFile[];
}