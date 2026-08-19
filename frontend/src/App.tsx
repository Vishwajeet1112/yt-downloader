import { useEffect, useRef, useState } from "react";
import { Download, Link, Loader2, XCircle, CheckCircle2, AlertCircle, Youtube, Music, Video, ListVideo, RotateCw, Trash2, FolderOpen } from "lucide-react";
import "./index.css";

const API = "https://yt-downloader-production-0b18.up.railway.app/api";

type VideoInfo = { success?: boolean; title: string; thumbnail: string; uploader: string; duration: string; duration_seconds?: number; view_count: number; upload_date: string; webpage_url: string; id?: string; channel?: string; channel_url?: string; description?: string; };
type Job = { id: string; url: string; quality: string; status: string; progress: number; speed?: string; eta?: string; downloaded?: string; total?: string; filename?: string; error?: string; current?: number; total_items?: number; completed?: number; };

type DirectoryHandle = FileSystemDirectoryHandle;

function App() {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("best");
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadFolder, setDownloadFolder] = useState<DirectoryHandle | null>(null);
  const [folderName, setFolderName] = useState("");
  const pollingRef = useRef<number | null>(null);

  const selectDownloadFolder = async () => {
    setError("");
    try {
      if (!("showDirectoryPicker" in window)) {
        setError("Folder selection is not supported in this browser. Please use Google Chrome or Microsoft Edge on desktop.");
        return;
      }
      const picker = (window as any).showDirectoryPicker;
      const handle: DirectoryHandle = await picker({ mode: "readwrite", startIn: "downloads" }).catch(async (err: any) => {
        if (err?.name === "NotFoundError") return picker({ mode: "readwrite" });
        throw err;
      });
      setDownloadFolder(handle);
      setFolderName(handle.name || "Selected folder");
    } catch (err: any) {
      if (err?.name !== "AbortError") setError(err?.message || "Unable to select download folder.");
    }
  };

  const saveBlobToFolder = async (response: Response, filename: string) => {
    if (!downloadFolder) return false;
    const fileHandle = await downloadFolder.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    try { await response.body?.pipeTo(writable); } catch (err) { await writable.abort(); throw err; }
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

  const startDownload = async () => {
    if (!url.trim()) { setError("Please enter a YouTube URL."); return; }
    setError("");
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
    try { const response = await fetch(`${API}/download/${id}/cancel`, { method: "POST", cache: "no-store" }); if (!response.ok) throw new Error("Unable to cancel download."); await refreshJobs(); }
    catch (err: any) { setError(err?.message || "Unable to cancel download."); }
  };

  const downloadCompletedFile = async (job: Job) => {
    if (!job.filename) { setError("The completed filename is not available yet."); return; }
    try {
      const response = await fetch(`${API}/download/${encodeURIComponent(job.id)}/file`, { cache: "no-store" });
      if (!response.ok) throw new Error(`File download failed (${response.status}).`);
      const safeName = job.filename.split(/[\\/]/).pop() || "download";
      if (downloadFolder) {
        await saveBlobToFolder(response, safeName);
        setError("");
        return;
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl; anchor.download = safeName; anchor.click();
      URL.revokeObjectURL(objectUrl);
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
        <div className="url-row"><div className="input-wrapper"><Link size={20} /><input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => { if (e.key === "Enter") void analyzeVideo(); }} placeholder="Paste YouTube video or playlist URL..." /></div><button className="primary-button" onClick={analyzeVideo} disabled={analyzing}>{analyzing ? <><Loader2 className="spin" size={20} />Analyzing...</> : <><RotateCw size={20} />Analyze</>}</button></div>
        {isPlaylist && <div className="playlist-detected"><ListVideo size={18} />Playlist URL detected</div>}
      </section>
      <section className="card folder-card">
        <div><label>Download Location</label><p>{folderName ? `Selected: ${folderName}` : "Choose where completed files should be saved on your computer."}</p></div>
        <button type="button" className="refresh-button" onClick={selectDownloadFolder}><FolderOpen size={19} />{folderName ? "Change Folder" : "Select Folder"}</button>
      </section>
      {error && <div className="error-box"><AlertCircle size={20} /><span>{error}</span><button onClick={() => setError("")}><XCircle size={18} /></button></div>}
      {video && <section className="card video-card"><div className="video-preview">{video.thumbnail && <img src={video.thumbnail} alt={video.title} />}<div className="video-details"><h3>{video.title}</h3><p className="channel">{video.uploader}</p><div className="video-meta"><span>{video.duration || "Unknown duration"}</span><span>{formatNumber(video.view_count)} views</span>{video.upload_date && <span>{video.upload_date}</span>}</div></div></div><div className="quality-section"><label>Download Quality</label><select value={quality} onChange={e => setQuality(e.target.value)}><option value="best">Best Quality</option><option value="4k">4K — Best Available</option><option value="1080">1080p — Full HD</option><option value="720">720p — HD</option><option value="480">480p</option><option value="360">360p</option><option value="audio">Audio — MP3</option></select><button className="download-button" onClick={startDownload}>{quality === "audio" ? <Music size={22} /> : <Video size={22} />}Download</button></div></section>}
      {jobs.length > 0 && <section className="downloads-section"><div className="section-title"><div><h2>Download Manager</h2><p>{jobs.length} download{jobs.length !== 1 ? "s" : ""}</p></div><button type="button" className="refresh-button" onClick={reloadPage} disabled={refreshing}><RotateCw size={19} className={refreshing ? "spin" : ""} />{refreshing ? "Reloading..." : "Refresh"}</button></div>
        {jobs.map(job => { const progress = Math.min(100, Math.max(0, Number(job.progress) || 0)); const completed = job.status === "completed" || job.status === "finished"; const failed = job.status === "error" || job.status === "failed"; const cancelled = job.status === "cancelled"; return <div className="card job-card" key={job.id}>
          <div className="job-header"><div className="job-title">{completed ? <CheckCircle2 size={24} className="green" /> : failed || cancelled ? <AlertCircle size={24} className="red" /> : <Download size={24} />}<div><h3>{job.filename || "YouTube Download"}</h3><p>{statusText(job.status)}</p></div></div><strong>{progress}%</strong></div>
          {(job.total_items || job.current || job.completed) && <div className="playlist-counter"><ListVideo size={18} /><strong>{job.completed ?? job.current ?? 0}</strong><span>/</span><strong>{job.total_items ?? 0}</strong><span>videos completed</span></div>}
          <div className="progress-background"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <div className="job-info"><div><span>Speed</span><strong>{job.speed || "--"}</strong></div><div><span>ETA</span><strong>{job.eta || "--"}</strong></div><div><span>Quality</span><strong>{job.quality}</strong></div><div><span>Downloaded</span><strong>{job.downloaded || "--"}</strong></div><div><span>Total</span><strong>{job.total || "--"}</strong></div></div>
          {job.filename && <div className="filename"><span>File:</span>{job.filename}</div>}
          {job.error && <div className="job-error"><AlertCircle size={18} />{job.error}</div>}
          {!completed && !failed && !cancelled && <button className="cancel-button" onClick={() => void cancelDownload(job.id)}><Trash2 size={18} />Cancel Download</button>}
          {completed && <button type="button" className="download-button" onClick={() => void downloadCompletedFile(job)}><Download size={20} />{downloadFolder ? "Save to Selected Folder" : "Download File"}</button>}
        </div>; })}
      </section>}
    </main>
    <footer>YT Downloader · Powered by yt-dlp</footer>
  </div>;
}

export default App;
