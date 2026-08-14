import { useEffect, useRef, useState } from "react";
import {
  Download,
  Link,
  Loader2,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Youtube,
  Music,
  Video,
  ListVideo,
  RotateCw,
  Trash2,
} from "lucide-react";

import "./index.css";

const API = "http://localhost:3001/api";

type VideoInfo = {
  success?: boolean;
  title: string;
  thumbnail: string;
  uploader: string;
  duration: string;
  duration_seconds?: number;
  view_count: number;
  upload_date: string;
  webpage_url: string;
  id?: string;
  channel?: string;
  channel_url?: string;
  description?: string;
};

type Job = {
  id: string;
  url: string;
  quality: string;
  status: string;
  progress: number;
  speed?: string;
  eta?: string;
  downloaded?: string;
  total?: string;
  filename?: string;
  error?: string;

  current?: number;
  total_items?: number;
  completed?: number;
};

function App() {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("best");

  const [video, setVideo] = useState<VideoInfo | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const [jobs, setJobs] = useState<Job[]>([]);

  const pollingRef = useRef<number | null>(null);

  /*
  ==========================================
  ANALYZE
  ==========================================
  */

  const analyzeVideo = async () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL.");
      return;
    }

    setError("");
    setVideo(null);
    setAnalyzing(true);

    try {
      const response = await fetch(`${API}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to analyze this URL."
        );
      }

      setVideo(data);
    } catch (err: any) {
      setError(
        err?.message || "Unable to analyze video."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  /*
  ==========================================
  START DOWNLOAD
  ==========================================
  */

  const startDownload = async () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL.");
      return;
    }

    setError("");

    try {
      const response = await fetch(`${API}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          quality,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Download could not be started."
        );
      }

      if (data.job) {
        setJobs((previous) => {
          const exists = previous.some(
            (job) => job.id === data.job.id
          );

          if (exists) {
            return previous;
          }

          return [data.job, ...previous];
        });
      }
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to start download."
      );
    }
  };

  /*
  ==========================================
  POLL JOBS
  ==========================================
  */

  const refreshJobs = async () => {
    try {
      const response = await fetch(
        `${API}/downloads`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setJobs(data);
      }
    } catch {
      // Backend may be restarting.
    }
  };

  useEffect(() => {
    refreshJobs();

    pollingRef.current = window.setInterval(() => {
      refreshJobs();
    }, 1000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  /*
  ==========================================
  CANCEL
  ==========================================
  */

  const cancelDownload = async (id: string) => {
    try {
      await fetch(
        `${API}/download/${id}/cancel`,
        {
          method: "POST",
        }
      );

      await refreshJobs();
    } catch {
      setError("Unable to cancel download.");
    }
  };

  /*
  ==========================================
  FORMAT NUMBER
  ==========================================
  */

  const formatNumber = (
    number: number
  ) => {
    if (!number) {
      return "0";
    }

    return new Intl.NumberFormat(
      "en-IN"
    ).format(number);
  };

  /*
  ==========================================
  FORMAT STATUS
  ==========================================
  */

  const statusText = (
    status: string
  ) => {
    switch (status) {
      case "downloading":
        return "Downloading";

      case "processing":
        return "Processing";

      case "completed":
        return "Completed";

      case "finished":
        return "Completed";

      case "cancelled":
        return "Cancelled";

      case "error":
        return "Failed";

      case "failed":
        return "Failed";

      default:
        return status || "Waiting";
    }
  };

  /*
  ==========================================
  STATUS CLASS
  ==========================================
  */

  const statusClass = (
    status: string
  ) => {
    if (
      status === "completed" ||
      status === "finished"
    ) {
      return "status success";
    }

    if (
      status === "error" ||
      status === "failed"
    ) {
      return "status error";
    }

    if (
      status === "cancelled"
    ) {
      return "status cancelled";
    }

    return "status downloading";
  };

  /*
  ==========================================
  PLAYLIST DETECTION
  ==========================================
  */

  const isPlaylist =
    url.includes("list=");

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="header">
        <div className="brand">
          <div className="brand-icon">
            <Youtube size={28} />
          </div>

          <div>
            <h1>YT Downloader</h1>
            <p>Powered by yt-dlp</p>
          </div>
        </div>

        <div className="system-status">
          <span className="status-dot" />
          System Ready
        </div>
      </header>

      
      {/* ================= MAIN ================= */}

      <main className="container">

        <section className="hero">
          <h2>Download Videos</h2>

          <p>
            Fast and simple YouTube
            video and playlist downloader.
          </p>
        </section>

        {/* ================= URL CARD ================= */}

        <section className="card url-card">

          <label>
            YouTube URL
          </label>

          <div className="url-row">

            <div className="input-wrapper">
              <Link size={20} />

              <input
                value={url}
                onChange={(e) =>
                  setUrl(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    analyzeVideo();
                  }
                }}
                placeholder="Paste YouTube video or playlist URL..."
              />
            </div>

            <button
              className="primary-button"
              onClick={analyzeVideo}
              disabled={analyzing}
            >
              {analyzing ? (
                <>
                  <Loader2
                    className="spin"
                    size={20}
                  />

                  Analyzing...
                </>
              ) : (
                <>
                  <RotateCw size={20} />

                  Analyze
                </>
              )}
            </button>

          </div>

          {isPlaylist && (
            <div className="playlist-detected">
              <ListVideo size={18} />

              Playlist URL detected
            </div>
          )}

        </section>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="error-box">
            <AlertCircle size={20} />

            <span>{error}</span>

            <button
              onClick={() => setError("")}
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* ================= VIDEO INFO ================= */}

        {video && (
          <section className="card video-card">

            <div className="video-preview">

              {video.thumbnail && (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                />
              )}

              <div className="video-details">

                <h3>
                  {video.title}
                </h3>

                <p className="channel">
                  {video.uploader}
                </p>

                <div className="video-meta">

                  <span>
                    {video.duration ||
                      "Unknown duration"}
                  </span>

                  <span>
                    {formatNumber(
                      video.view_count
                    )}{" "}
                    views
                  </span>

                  {video.upload_date && (
                    <span>
                      {video.upload_date}
                    </span>
                  )}

                </div>

              </div>

            </div>

            {/* ================= QUALITY ================= */}

            <div className="quality-section">

              <label>
                Download Quality
              </label>

              <select
                value={quality}
                onChange={(e) =>
                  setQuality(e.target.value)
                }
              >
                <option value="best">
                  Best Quality
                </option>

                <option value="4k">
                  4K — Best Available
                </option>

                <option value="1080">
                  1080p — Full HD
                </option>

                <option value="720">
                  720p — HD
                </option>

                <option value="480">
                  480p
                </option>

                <option value="360">
                  360p
                </option>

                <option value="audio">
                  Audio — MP3
                </option>
              </select>

              <button
                className="download-button"
                onClick={startDownload}
              >
                {quality === "audio" ? (
                  <Music size={22} />
                ) : (
                  <Video size={22} />
                )}

                Download
              </button>

            </div>

          </section>
        )}

        {/* ================= DOWNLOAD MANAGER ================= */}

        {jobs.length > 0 && (
          <section className="downloads-section">

            <div className="section-title">

              <div>
                <h2>
                  Download Manager
                </h2>

                <p>
                  {jobs.length} download
                  {jobs.length !== 1
                    ? "s"
                    : ""}
                </p>
              </div>

              <button
                className="refresh-button"
                onClick={refreshJobs}
              >
                <RotateCw size={19} />

                Refresh
              </button>

            </div>

            {jobs.map((job) => {

              const progress = Math.min(
                100,
                Math.max(
                  0,
                  Number(job.progress) || 0
                )
              );

              const completed =
                job.status ===
                  "completed" ||
                job.status ===
                  "finished";

              const failed =
                job.status ===
                  "error" ||
                job.status ===
                  "failed";

              const cancelled =
                job.status ===
                "cancelled";

              return (
                <div
                  className="card job-card"
                  key={job.id}
                >

                  {/* JOB HEADER */}

                  <div className="job-header">

                    <div className="job-title">

                      {completed ? (
                        <CheckCircle2
                          size={24}
                          className="green"
                        />
                      ) : failed ||
                        cancelled ? (
                        <AlertCircle
                          size={24}
                          className="red"
                        />
                      ) : (
                        <Download
                          size={24}
                        />
                      )}

                      <div>
                        <h3>
                          {job.filename ||
                            "YouTube Download"}
                        </h3>

                        <p>
                          {statusText(
                            job.status
                          )}
                        </p>
                      </div>

                    </div>

                    <strong>
                      {progress}%
                    </strong>

                  </div>

                  {/* PLAYLIST COUNTER */}

                  {(job.total_items ||
                    job.current ||
                    job.completed) && (
                    <div className="playlist-counter">
                      <ListVideo size={18} />

                      <strong>
                        {job.completed ??
                          job.current ??
                          0}
                      </strong>

                      <span>
                        /
                      </span>

                      <strong>
                        {job.total_items ??
                          0}
                      </strong>

                      <span>
                        videos completed
                      </span>
                    </div>
                  )}

                  {/* PROGRESS */}

                  <div className="progress-background">

                    <div
                      className="progress-fill"
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>

                  {/* INFO */}

                  <div className="job-info">

                    <div>
                      <span>
                        Speed
                      </span>

                      <strong>
                        {job.speed ||
                          "--"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        ETA
                      </span>

                      <strong>
                        {job.eta ||
                          "--"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Quality
                      </span>

                      <strong>
                        {job.quality}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Downloaded
                      </span>

                      <strong>
                        {job.downloaded ||
                          "--"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Total
                      </span>

                      <strong>
                        {job.total ||
                          "--"}
                      </strong>
                    </div>

                  </div>

                  {/* FILE */}

                  {job.filename && (
                    <div className="filename">
                      <span>
                        File:
                      </span>

                      {job.filename}
                    </div>
                  )}

                  {/* ERROR */}

                  {job.error && (
                    <div className="job-error">
                      <AlertCircle
                        size={18}
                      />

                      {job.error}
                    </div>
                  )}

                  {/* ACTION */}

                  {!completed &&
                    !failed &&
                    !cancelled && (
                      <button
                        className="cancel-button"
                        onClick={() =>
                          cancelDownload(
                            job.id
                          )
                        }
                      >
                        <Trash2 size={18} />

                        Cancel Download
                      </button>
                    )}

                  {completed && (
                    <div className="completed-box">
                      <CheckCircle2
                        size={19}
                      />

                      Download completed
                    </div>
                  )}

                </div>
              );
            })}

          </section>
        )}

      </main>

      {/* ================= FOOTER ================= */}

      <footer>
        YT Downloader · Powered by yt-dlp
      </footer>

    </div>
  );
}

export default App;