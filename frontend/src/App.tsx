import { useEffect, useRef, useState } from "react";
import { Download, Link, Loader2, XCircle, CheckCircle2, AlertCircle, Youtube, Music, Video, ListVideo, RotateCw, Trash2, FolderOpen } from "lucide-react";
import "./index.css";

const API = "https://yt-downloader-production-0b18.up.railway.app/api";

type VideoInfo = { success?: boolean; title: string; thumbnail: string; uploader: string; duration: string; duration_seconds?: number; view_count: number; upload_date: string; webpage_url: string; id?: string; channel?: string; channel_url?: string; description?: string; };
type Job = { id: string; url: string; quality: string; status: string; progress: number; speed?: string; eta?: string; downloaded?: string; total?: string; filename?: string; error?: string; current?: number; total_items?: number; completed?: number; };
type DirectoryPickerWindow = Window & { showDirectoryPicker?: (options?: { mode?: "read" | "readwrite" }) => Promise<any> };

function App() {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("best");
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadFolder, setDownloadFolder] = useState<any>(null);
  const [folderName, setFolderName] = useState("");
  const pollingRef = useRef<number | null>(null);

  const selectDownloadFolder = async () => {
    setError("");
    const pickerWindow = window as DirectoryPickerWindow;
    if (typeof pickerWindow.showDirectoryPicker !== "function") {
      setError("Folder selection requires Google Chrome or Microsoft Edge desktop over HTTPS.");
      return null;
    }
    try {
      const handle = await pickerWindow.showDirectoryPicker({ mode: "readwrite" });
      if (!handle) return null;
      setDownloadFolder(handle);
      setFolderName(handle.name || "Selected folder");
      return handle;
    } catch (err: any) {
      if (err?.name === "AbortError") return null;
      console.error("Folder picker error:", err);
      setError(err?.message || "Unable to open the folder picker.");
      return null;
    }
  };

  const saveBlobToFolder = async (response: Response, filename: string, folder = downloadFolder) => {
    if (!folder) return false;
    const cleanName = filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim() || "download";
    const fileHandle = await folder.getFileHandle(cleanName, { create: true });
    const writable = await fileHandle.createWritable();
    try {
      if (response.body) await response.body.pipeTo(writable);
      else await writable.close();
    } catch (err) {
      try { await writable.abort(); } catch { /* ignore */ }
      throw err;
    }
    return true;
  };

  const analyzeVideo = async () => {
    if (!url.trim()) { setError("Please enter a YouTube URL."); return; }
    setError(""); setVideo(null); setAnalyzing(true);
    try {
      const response = await fetch(`${API}/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ url: url.trim() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to analyze this URL.");
      setVideo(data);
    } catch (err: any) { setError(err?.message || "Unable to analyze video."); }
    finally { setAnalyzing(false); }
  };

  // Clicking Download first asks for the local Windows folder, then starts the server job.
  const startDownload = async () => {
    if (!url.trim()) { setError("Please enter a YouTube URL."); return; }
    setError("");
    let selectedFolder = downloadFolder;
    if (!selectedFolder) {
      selectedFolder = await selectDownloadFolder();
      if (!selectedFolder) return;
    }
    try {
      const response = await fetch(`${API}/download`, { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ url: url.trim(), quality }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Download could not be started.");
      if (data.job) setJobs(previous => previous.some(job => job.id === data.job.id) ? previous : [data.job, ...previous]);
      await refreshJobs();
    } catch (err: any) { setError(err?.message || "Unable to start download."); }
  };

  const refreshJobs = async () => {
    try {
      const response = await fetch(`${API}/downloads?_=${Date.now()}`, { method: "GET", cache: "no-store", headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache" } });
      if (!response.ok) throw new Error(`Refresh failed (${response.status})`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid download list received from server.");
      setJobs(data);
    } catch (err: any) { setError(err?.message || "Unable to refresh downloads."); }
  };

  const reloadPage = () => { if (refreshing) return; setRefreshing(true); window.location.reload(); };

  useEffect(() => {
    void refreshJobs();
    pollingRef.current = window.setInterval(() => void refreshJobs(), 1000);
    return () => { if (pollingRef.current !== null) window.clearInterval(pollingRef.current); };
  }, []);

  const cancelDownload = async (id: string) => {
    try { const response = await fetch(`${API}/download/${encodeURIComponent(id)}/cancel`, { method: "POST", cache: "no-store" }); if (!response.ok) throw new Error("Unable to cancel download."); await refreshJobs(); }
    catch (err: any) { setError(err?.message || "Unable to cancel download."); }
  };

  const downloadCompletedFile = async (job: Job) => {
    if (!job.filename) { setError("The completed filename is not available yet."); return; }
    try {
      let folder = downloadFolder;
      if (!folder) folder = await selectDownloadFolder();
      if (!folder) return;
      const response = await fetch(`${API}/download/${encodeURIComponent(job.id)}/file`, { cache: "no-store" });
      if (!response.ok) throw new Error(`File download failed (${response.status}).`);
      const safeName = job.filename.split(/[\\/]/).pop() || "download";
      await saveBlobToFolder(response, safeName, folder);
      setError("");
    } catch (err: any) { setError(err?.message || "Unable to save completed file."); }
  };

  const formatNumber = (number: number) => number ? new Intl.NumberFormat("en-IN").format(number) : "0";
  const statusText = (status: string) => ({ downloading: "Downloading", processing: "Processing", completed: "Completed", finished: "Completed", cancelled: "Cancelled", error: "Failed", failed: "Failed" } as Record<string,string>)[status] || status || "Waiting";
  const isPlaylist = url.includes("list=");

  return <div className="app">
    <header className="header"><div className="brand"><div className="brand-icon"><Youtube size={28} /></div><div><h1>YT Downloader</h1><p>Powered by yt-dlp</p></div></div><div className="system-status"><span className="status-dot" />System Ready</div></header>
    <main className="container">
      <section className="hero"><h2>Download Videos</h2><p>Fast and simple YouTube video and playlist downloader.</p></section>
      <section className="card url-card">
        <label>YouTube URL</label>
        <div className="url-row"><div className="input-wrapper"><Link size={20} /><input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => { if (e.key === "Enter") void analyzeVideo(); }} placeholder="Paste YouTube video or playlist URL..." /></div><button type="button" className="primary-button" onClick={() => void analyzeVideo()} disabled={analyzing}>{analyzing ? <><Loader2 className="spin" size={20} />Analyzing...</> : <><RotateCw size={20} />Analyze</>}</button></div>
        {isPlaylist && <div className="playlist-detected"><ListVideo size={18} />Playlist URL detected</div>}
      </section>
      {error && <div className="error-box"><AlertCircle size={20} /><span>{error}</span><button type="button" onClick={() => setError("")}><XCircle size={18} /></button></div>}
      {video && <section className="card video-card"><div className="video-preview">{video.thumbnail && <img src={video.thumbnail} alt={video.title} />}<div className="video-details"><h3>{video.title}</h3><p className="channel">{video.uploader}</p><div className="video-meta"><span>{video.duration || "Unknown duration"}</span><span>{formatNumber(video.view_count)} views</span>{video.upload_date && <span>{video.upload_date}</span>}</div></div></div><div className="quality-section"><label>Download Quality</label><select value={quality} onChange={e => setQuality(e.target.value)}><option value="best">Best Quality</option><option value="4k">4K — Best Available</option><option value="1080">1080p — Full HD</option><option value="720">720p — HD</option><option value="480">480p</option><option value="360">360p</option><option value="audio">Audio — MP3</option></select><button type="button" className="download-button" onClick={() => void startDownload()}>{quality === "audio" ? <Music size={22} /> : <Video size={22} />}Download</button></div></section>}
      {jobs.length > 0 && <section className="downloads-section"><div className="section-title"><div><h2>Download Manager</h2><p>{jobs.length} download{jobs.length !== 1 ? "s" : ""}</p></div><button type="button" className="refresh-button" onClick={reloadPage} disabled={refreshing}><RotateCw size={19} className={refreshing ? "spin" : ""} />{refreshing ? "Reloading..." : "Refresh"}</button></div>
        {jobs.map(job => { const progress = Math.min(100, Math.max(0, Number(job.progress) || 0)); const completed = job.status === "completed" || job.status === "finished"; const failed = job.status === "error" || job.status === "failed"; const cancelled = job.status === "cancelled"; return <div className="card job-card" key={job.id}>
          <div className="job-header"><div className="job-title">{completed ? <CheckCircle2 size={24} className="green" /> : failed || cancelled ? <AlertCircle size={24} className="red" /> : <Download size={24} />}<div><h3>{job.filename || "YouTube Download"}</h3><p>{statusText(job.status)}</p></div></div><strong>{progress}%</strong></div>
          {(job.total_items || job.current || job.completed) && <div className="playlist-counter"><ListVideo size={18} /><strong>{job.completed ?? job.current ?? 0}</strong><span>/</span><strong>{job.total_items ?? 0}</strong><span>videos completed</span></div>}
          <div className="progress-background"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <div className="job-info"><div><span>Speed</span><strong>{job.speed || "--"}</strong></div><div><span>ETA</span><strong>{job.eta || "--"}</strong></div><div><span>Quality</span><strong>{job.quality}</strong></div><div><span>Downloaded</span><strong>{job.downloaded || "--"}</strong></div><div><span>Total</span><strong>{job.total || "--"}</strong></div></div>
          {job.filename && <div className="filename"><span>File:</span>{job.filename}</div>}
          {job.error && <div className="job-error"><AlertCircle size={18} />{job.error}</div>}
          {!completed && !failed && !cancelled && <button type="button" className="cancel-button" onClick={() => void cancelDownload(job.id)}><Trash2 size={18} />Cancel Download</button>}
          {completed && <button type="button" className="download-button" onClick={() => void downloadCompletedFile(job)}><Download size={20} />{downloadFolder ? "Save to Selected Folder" : "Download File"}</button>}
        </div>; })}
      </section>}
    </main>
    <footer>YT Downloader · Powered by yt-dlp</footer>
  </div>;
}

export default App;
