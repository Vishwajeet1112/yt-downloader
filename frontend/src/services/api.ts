import axios from "axios";

import type {
  DownloadJob,
  DownloadQuality,
  VideoInfo,
} from "../types";


/*
==================================================
BACKEND API URL
==================================================
*/

export const API =
<<<<<<< HEAD
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";
=======
  "https://yt-downloader-production-0b18.up.railway.app";
>>>>>>> 4544ec9 (Fix backend API and yt-dlp downloads)


/*
==================================================
AXIOS INSTANCE
==================================================
*/

export const api =
  axios.create({
    baseURL: API,

    headers: {
      "Content-Type":
        "application/json",
    },
  });


/*
==================================================
ANALYZE URL
==================================================
*/

export async function analyzeUrl(
  url: string
): Promise<VideoInfo> {

  const response =
    await api.post(
      "/api/analyze",
      {
        url,
      }
    );


  return response.data;
}


/*
==================================================
START DOWNLOAD
==================================================
*/

export async function addDownload(
  url: string,
  quality: DownloadQuality
): Promise<DownloadJob> {

  const response =
    await api.post(
      "/api/download",
      {
        url,

        options: {
          quality,
        },
      }
    );


  return response.data.job;
}


/*
==================================================
GET ALL JOBS
==================================================
*/

export async function getJobs():
  Promise<DownloadJob[]> {

  const response =
    await api.get(
      "/api/downloads"
    );


  return response.data;
}


/*
==================================================
GET SINGLE JOB
==================================================
*/

export async function getJob(
  id: string
): Promise<DownloadJob> {

  const response =
    await api.get(
      `/api/download/${id}`
    );


  return response.data;
}


/*
==================================================
CANCEL JOB
==================================================
*/

export async function cancelJob(
  id: string
) {

  return api.post(
    `/api/download/${id}/cancel`
  );
}


/*
==================================================
RETRY JOB
==================================================
*/

export async function retryJob(
  id: string
) {

  return api.post(
    `/api/download/${id}/retry`
  );
}


/*
==================================================
REMOVE JOB
==================================================
*/

export async function removeJob(
  id: string
) {

  return api.delete(
    `/api/download/${id}`
  );
}


/*
==================================================
DOWNLOAD COMPLETED FILE
==================================================
*/

export async function downloadFile(
  id: string
): Promise<Response> {

  const response =
    await fetch(
      `${API}/api/download/${id}/file`
    );


  if (
    !response.ok
  ) {

    throw new Error(
      `File download failed: ${response.status}`
    );

  }


  return response;
}


/*
==================================================
DOWNLOAD PLAYLIST FILE
==================================================
*/

export async function downloadPlaylistFile(
  jobId: string,
  filename: string
): Promise<Response> {

  const encodedFilename =
    encodeURIComponent(
      filename
    );


  const response =
    await fetch(
      `${API}/api/download/${jobId}/file/${encodedFilename}`
    );


  if (
    !response.ok
  ) {

    throw new Error(
      `Playlist file download failed: ${response.status}`
    );

  }


  return response;
}


/*
==================================================
DEFAULT EXPORT
==================================================
*/

export default api;
