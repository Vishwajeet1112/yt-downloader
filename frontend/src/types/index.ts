export type DownloadQuality =
  | "best"
  | "4k"
  | "1080"
  | "720"
  | "480"
  | "360"
  | "audio";

export interface DownloadedFile {
  index: number;
  filename: string;
  filePath: string;
  title: string;
  id: string;
}

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail?: string;
  uploader?: string;
  channel?: string;
  channel_url?: string;

  duration?: number;
  duration_string?: string;
  duration_seconds?: number;

  view_count?: number;
  upload_date?: string;

  webpage_url?: string;
  description?: string;

  formats?: VideoFormat[];
}

export interface VideoFormat {
  format_id: string;
  ext?: string;
  resolution?: string;
  height?: number;
  width?: number;
  filesize?: number;
  hasVideo?: boolean;
  hasAudio?: boolean;
}

export type JobStatus =
  | "queued"
  | "analyzing"
  | "downloading"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

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

  isPlaylist?: boolean;

  totalVideos: number;
  completedVideos: number;
  skippedVideos: number;
  currentVideo: number;

  currentTitle: string;

  files: DownloadedFile[];
}