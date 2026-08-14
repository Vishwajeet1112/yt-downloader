import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FolderOpen,
  Download,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileVideo,
} from "lucide-react";

import {
  Button,
} from "../components/ui/button";

import {
  Progress,
} from "../components/ui/progress";

import {
  Card,
  CardContent,
} from "../components/ui/card";

import {
  api,
} from "../services/api";

import type {
  DownloadJob,
  DownloadedFile,
} from "../types";


/*
==================================================
WINDOW FILE SYSTEM ACCESS API
==================================================
*/

declare global {
  interface Window {
    showDirectoryPicker?: (
      options?: {
        id?: string;
        mode?: "read" | "readwrite";
        startIn?:
          | "desktop"
          | "documents"
          | "downloads"
          | "music"
          | "pictures"
          | "videos";
      }
    ) => Promise<FileSystemDirectoryHandle>;
  }
}


/*
==================================================
STATUS LABEL
==================================================
*/

const getStatusLabel = (
  job: DownloadJob
): string => {

  switch (job.status) {

    case "queued":
      return "Queued";

    case "analyzing":
      return "Analyzing";

    case "downloading":
      return "Downloading";

    case "processing":
      return "Processing";

    case "completed":
      return "Completed";

    case "failed":
      return "Failed";

    case "cancelled":
      return "Cancelled";

    default:
      return job.status;
  }
};


/*
==================================================
STATUS COLOR
==================================================
*/

const getStatusClass = (
  status: DownloadJob["status"]
): string => {

  switch (status) {

    case "completed":
      return "text-green-600";

    case "failed":
      return "text-red-600";

    case "cancelled":
      return "text-gray-500";

    case "downloading":
      return "text-blue-600";

    case "analyzing":
      return "text-purple-600";

    default:
      return "text-yellow-600";
  }
};


/*
==================================================
DOWNLOADS PAGE
==================================================
*/

const Downloads: React.FC = () => {

  /*
  ==============================================
  STATE
  ==============================================
  */

  const [
    jobs,
    setJobs,
  ] = useState<DownloadJob[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState<string | null>(null);


  /*
  ==============================================
  SELECTED FOLDER
  ==============================================
  */

  const [
    selectedFolder,
    setSelectedFolder,
  ] = useState<
    FileSystemDirectoryHandle | null
  >(null);


  /*
  ==============================================
  SAVE STATE
  ==============================================
  */

  const [
    savingJobId,
    setSavingJobId,
  ] = useState<string | null>(null);


  const [
    savingFile,
    setSavingFile,
  ] = useState<string | null>(null);


  const [
    saveProgress,
    setSaveProgress,
  ] = useState(0);


  /*
  ==============================================
  SAVED FILES
  ==============================================
  */

  const [
    savedFiles,
    setSavedFiles,
  ] = useState<
    Record<string, number>
  >({});


  /*
  ==============================================
  POLLING
  ==============================================
  */

  const pollingRef =
    useRef<number | null>(null);


  /*
  ==============================================
  CHECK FOLDER API
  ==============================================
  */

  const folderPickerSupported =
    typeof window !== "undefined" &&
    typeof window.showDirectoryPicker === "function";


  /*
  ==============================================
  FETCH JOBS
  ==============================================
  */

  const fetchJobs =
    useCallback(
      async () => {

        try {

          const response =
            await api.get(
              "/api/downloads"
            );


          setJobs(
            response.data
          );


          setError(
            null
          );

        } catch (
          err: any
        ) {

          console.error(
            "Failed to fetch jobs:",
            err
          );


          setError(
            err?.response?.data?.error ||
            err?.message ||
            "Could not load downloads."
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      []
    );


  /*
  ==============================================
  INITIAL FETCH
  ==============================================
  */

  useEffect(
    () => {

      fetchJobs();

    },
    [
      fetchJobs,
    ]
  );


  /*
  ==============================================
  POLLING
  ==============================================
  */

  useEffect(
    () => {

      pollingRef.current =
        window.setInterval(
          () => {

            fetchJobs();

          },
          2000
        );


      return () => {

        if (
          pollingRef.current !== null
        ) {

          window.clearInterval(
            pollingRef.current
          );

          pollingRef.current =
            null;
        }

      };

    },
    [
      fetchJobs,
    ]
  );


  /*
  ==============================================
  CHOOSE FOLDER
  ==============================================
  */

  const chooseFolder =
    async () => {

      if (
        !folderPickerSupported
      ) {

        alert(
          "Your browser does not support folder selection. Please use Google Chrome or Microsoft Edge."
        );

        return null;
      }


      try {

        const folder =
          await window.showDirectoryPicker!(
            {
              id:
                "yt-downloader",

              mode:
                "readwrite",

              startIn:
                "downloads",
            }
          );


        setSelectedFolder(
          folder
        );


        return folder;

      } catch (
        err: any
      ) {

        /*
        User cancelled folder picker
        */

        if (
          err?.name === "AbortError"
        ) {

          return null;
        }


        console.error(
          "Folder picker error:",
          err
        );


        alert(
          "Unable to select folder."
        );


        return null;
      }
    };


  /*
  ==============================================
  STREAM RESPONSE TO FILE
  ==============================================
  */

  const streamResponseToFile =
    async (
      response: Response,
      folder: FileSystemDirectoryHandle,
      filename: string,
      progressStart: number = 0,
      progressEnd: number = 100
    ) => {

      if (
        !response.body
      ) {

        throw new Error(
          "Download stream is not available."
        );
      }


      /*
      Native browser API.
      No custom FileSystemFileHandle
      interface is required.
      */

      const fileHandle =
        await folder.getFileHandle(
          filename,
          {
            create: true,
          }
        );


      const writable =
        await fileHandle.createWritable();


      const reader =
        response.body.getReader();


      const contentLength =
        Number(
          response.headers.get(
            "content-length"
          ) || 0
        );


      let received = 0;


      try {

        while (true) {

          const {
            done,
            value,
          } =
            await reader.read();


          if (
            done
          ) {

            break;
          }


          if (
            value
          ) {

            await writable.write(
              value
            );


            received +=
              value.byteLength;


            if (
              contentLength > 0
            ) {

              const percent =
                (
                  received /
                  contentLength
                ) *
                100;


              const mapped =
                progressStart +
                (
                  percent /
                  100
                ) *
                (
                  progressEnd -
                  progressStart
                );


              setSaveProgress(
                Math.min(
                  100,
                  mapped
                )
              );
            }

          }

        }


        await writable.close();

      } catch (
        error
      ) {

        try {

          /*
          Abort the writable stream
          when possible.
          */

          if (
            "abort" in writable &&
            typeof writable.abort === "function"
          ) {

            await writable.abort();

          }

        } catch {
          // ignore
        }


        throw error;
      }
    };


  /*
  ==============================================
  SAVE SINGLE FILE
  ==============================================
  */

  const saveSingleFile =
    async (
      jobId: string,
      filename: string,
      folder: FileSystemDirectoryHandle,
      index: number = 0,
      total: number = 1
    ) => {

      const response =
        await fetch(
          `${api.defaults.baseURL}/api/download/${jobId}/file`
        );


      if (
        !response.ok
      ) {

        let message =
          "Could not download file.";

        try {

          const data =
            await response.json();

          message =
            data?.error ||
            message;

        } catch {
          // ignore
        }


        throw new Error(
          message
        );
      }


      const start =
        total > 1
          ? (
              index /
              total
            ) *
            100
          : 0;


      const end =
        total > 1
          ? (
              (
                index + 1
              ) /
              total
            ) *
            100
          : 100;


      await streamResponseToFile(
        response,
        folder,
        filename,
        start,
        end
      );


      setSavedFiles(
        previous => ({
          ...previous,

          [`${jobId}:${filename}`]:
            1,
        })
      );
    };


  /*
  ==============================================
  SAVE COMPLETED JOB
  ==============================================
  */

  const saveJob =
    async (
      job: DownloadJob
    ) => {

      /*
      ==========================================
      SELECT FOLDER
      ==========================================
      */

      let folder =
        selectedFolder;


      if (!folder) {

        folder =
          await chooseFolder();

      }


      if (!folder) {

        return;
      }


      /*
      ==========================================
      SAVE STATE
      ==========================================
      */

      setSavingJobId(
        job.id
      );


      setSaveProgress(
        0
      );


      setError(
        null
      );


      try {

        /*
        ========================================
        PLAYLIST
        ========================================
        */

        if (
          job.isPlaylist &&
          job.files &&
          job.files.length > 0
        ) {

          const files =
            job.files;


          for (
            let i = 0;
            i < files.length;
            i++
          ) {

            const file =
              files[i];


            setSavingFile(
              file.filename
            );


            const key =
              `${job.id}:${file.filename}`;


            /*
            Skip already saved file
            */

            if (
              savedFiles[key]
            ) {

              continue;
            }


            /*
            Single playlist file
            */

            if (
              files.length === 1
            ) {

              await saveSingleFile(
                job.id,
                file.filename,
                folder,
                i,
                files.length
              );

            } else {

              /*
              Playlist-specific endpoint
              */

              const encoded =
                encodeURIComponent(
                  file.filename
                );


              const response =
                await fetch(
                  `${api.defaults.baseURL}/api/download/${job.id}/file/${encoded}`
                );


              if (
                !response.ok
              ) {

                let message =
                  `Could not save ${file.filename}`;

                try {

                  const data =
                    await response.json();

                  message =
                    data?.error ||
                    message;

                } catch {
                  // ignore
                }


                throw new Error(
                  message
                );
              }


              await streamResponseToFile(
                response,
                folder,
                file.filename,
                (
                  i /
                  files.length
                ) *
                  100,
                (
                  (
                    i + 1
                  ) /
                  files.length
                ) *
                  100
              );


              setSavedFiles(
                previous => ({
                  ...previous,

                  [`${job.id}:${file.filename}`]:
                    1,
                })
              );
            }

          }

        } else {

          /*
          ======================================
          SINGLE VIDEO
          ======================================
          */

          const filename =
            job.filename ||
            `video-${job.id}.mp4`;


          setSavingFile(
            filename
          );


          await saveSingleFile(
            job.id,
            filename,
            folder
          );
        }


        setSaveProgress(
          100
        );


        setSavingFile(
          null
        );


        alert(
          `Download saved successfully to "${folder.name}".`
        );

      } catch (
        err: any
      ) {

        console.error(
          "Save file error:",
          err
        );


        setError(
          err?.message ||
          "Could not save file."
        );


        alert(
          err?.message ||
          "Could not save file."
        );

      } finally {

        setSavingJobId(
          null
        );


        setSavingFile(
          null
        );
      }
    };


  /*
  ==============================================
  CANCEL
  ==============================================
  */

  const cancelDownload =
    async (
      jobId: string
    ) => {

      try {

        await api.post(
          `/api/download/${jobId}/cancel`
        );


        await fetchJobs();

      } catch (
        err: any
      ) {

        console.error(
          "Cancel error:",
          err
        );


        alert(
          err?.response?.data?.error ||
          "Could not cancel download."
        );
      }
    };


  /*
  ==============================================
  MANUAL REFRESH
  ==============================================
  */

  const refresh =
    async () => {

      setLoading(
        true
      );


      await fetchJobs();

    };


  /*
  ==============================================
  LOADING
  ==============================================
  */

  if (
    loading &&
    jobs.length === 0
  ) {

    return (

      <div
        className="
          flex
          justify-center
          py-12
        "
      >

        <Loader2
          className="animate-spin"
          size={32}
        />

      </div>
    );
  }


  /*
  ==============================================
  RENDER
  ==============================================
  */

  return (

    <div
      className="
        space-y-6
      "
    >

      {/* ======================================
          HEADER
      ====================================== */}

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <div>

          <h2
            className="
              text-2xl
              font-bold
            "
          >
            Download Queue
          </h2>


          <p
            className="
              text-sm
              text-muted-foreground
            "
          >
            Manage your video and playlist
            downloads.
          </p>

        </div>


        <Button
          variant="outline"
          onClick={refresh}
          disabled={loading}
          className="
            flex
            items-center
            gap-2
          "
        >

          <RefreshCw
            size={16}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh

        </Button>

      </div>


      {/* ======================================
          ERROR
      ====================================== */}

      {error && (

        <div
          className="
            rounded-lg
            border
            border-red-300
            bg-red-50
            p-4
            text-red-700
            flex
            items-center
            gap-2
          "
        >

          <AlertCircle
            size={18}
          />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ======================================
          SELECTED FOLDER
      ====================================== */}

      <Card>

        <CardContent
          className="
            p-4
          "
        >

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-4
            "
          >

            <div>

              <h3
                className="
                  font-semibold
                "
              >
                Download Location
              </h3>


              <p
                className="
                  text-sm
                  text-muted-foreground
                "
              >

                {selectedFolder
                  ? `Selected folder: ${selectedFolder.name}`
                  : "Choose a Windows folder when you are ready to save a completed download."}

              </p>

            </div>


            <Button
              variant="outline"
              onClick={
                chooseFolder
              }
              className="
                flex
                items-center
                gap-2
              "
            >

              <FolderOpen
                size={16}
              />

              {selectedFolder
                ? "Change Folder"
                : "Choose Folder"}

            </Button>

          </div>


          {!folderPickerSupported && (

            <p
              className="
                mt-3
                text-xs
                text-orange-600
              "
            >

              Your browser does not support
              the File System Access API.
              Use Chrome or Edge on desktop.

            </p>

          )}

        </CardContent>

      </Card>


      {/* ======================================
          EMPTY
      ====================================== */}

      {jobs.length === 0 && (

        <div
          className="
            text-center
            py-12
            text-muted-foreground
          "
        >

          <Download
            size={40}
            className="
              mx-auto
              mb-3
              opacity-50
            "
          />

          <p>
            No downloads yet.
          </p>

        </div>

      )}


      {/* ======================================
          JOBS
      ====================================== */}

      <div
        className="
          grid
          gap-4
        "
      >

        {jobs.map(
          job => (

            <Card
              key={
                job.id
              }
            >

              <CardContent
                className="
                  p-5
                "
              >

                {/* ==================================
                    TITLE
                ================================== */}

                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >

                  <div
                    className="
                      flex-1
                      min-w-0
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >

                      {job.status ===
                      "completed" ? (

                        <CheckCircle2
                          size={18}
                          className="
                            text-green-600
                            shrink-0
                          "
                        />

                      ) : job.status ===
                        "failed" ? (

                        <AlertCircle
                          size={18}
                          className="
                            text-red-600
                            shrink-0
                          "
                        />

                      ) : (

                        <Loader2
                          size={18}
                          className="
                            text-blue-600
                            animate-spin
                            shrink-0
                          "
                        />

                      )}


                      <h3
                        className="
                          font-semibold
                          truncate
                        "
                      >

                        {job.currentTitle ||
                          job.filename ||
                          "YouTube Download"}

                      </h3>

                    </div>


                    <p
                      className="
                        text-xs
                        text-muted-foreground
                        mt-1
                        break-all
                      "
                    >
                      {job.url}
                    </p>

                  </div>


                  {/* STATUS */}

                  <span
                    className={`
                      text-sm
                      font-medium
                      whitespace-nowrap
                      ${getStatusClass(
                        job.status
                      )}
                    `}
                  >

                    {getStatusLabel(
                      job
                    )}

                  </span>

                </div>


                {/* ==================================
                    PLAYLIST COUNTER
                ================================== */}

                {job.isPlaylist && (

                  <div
                    className="
                      mt-4
                      rounded-md
                      bg-muted
                      p-3
                    "
                  >

                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-4
                        text-sm
                      "
                    >

                      <span
                        className="
                          font-semibold
                        "
                      >
                        Playlist
                      </span>


                      <span>

                        Video:

                        {" "}

                        <strong>

                          {Math.min(
                            job.currentVideo || 0,
                            job.totalVideos || 0
                          )}

                        </strong>

                        {" / "}

                        <strong>

                          {job.totalVideos || 0}

                        </strong>

                      </span>


                      <span
                        className="
                          text-green-600
                        "
                      >

                        Completed:

                        {" "}

                        <strong>
                          {job.completedVideos || 0}
                        </strong>

                      </span>


                      <span
                        className="
                          text-orange-600
                        "
                      >

                        Skipped:

                        {" "}

                        <strong>
                          {job.skippedVideos || 0}
                        </strong>

                      </span>

                    </div>


                    {job.currentTitle && (

                      <p
                        className="
                          text-xs
                          text-muted-foreground
                          mt-2
                          truncate
                        "
                      >

                        Current:
                        {" "}
                        {job.currentTitle}

                      </p>

                    )}

                  </div>

                )}


                {/* ==================================
                    PROGRESS
                ================================== */}

                <div
                  className="
                    mt-4
                  "
                >

                  <div
                    className="
                      flex
                      justify-between
                      text-xs
                      mb-1
                    "
                  >

                    <span>
                      Download Progress
                    </span>


                    <span>

                      {Math.round(
                        job.progress || 0
                      )}

                      %

                    </span>

                  </div>


                  <Progress
                    value={
                      job.progress || 0
                    }
                    className="
                      h-2
                    "
                  />


                  <div
                    className="
                      flex
                      justify-between
                      text-xs
                      text-muted-foreground
                      mt-2
                    "
                  >

                    <span>
                      {job.downloaded ||
                        "0 B"}
                    </span>


                    <span>

                      {job.speed &&
                      job.speed !== "—"
                        ? job.speed
                        : ""}

                    </span>


                    <span>

                      {job.eta &&
                      job.eta !== "—"
                        ? `ETA ${job.eta}`
                        : ""}

                    </span>

                  </div>

                </div>


                {/* ==================================
                    SAVE PROGRESS
                ================================== */}

                {savingJobId ===
                  job.id && (

                  <div
                    className="
                      mt-4
                      rounded-md
                      border
                      p-3
                    "
                  >

                    <div
                      className="
                        flex
                        justify-between
                        text-sm
                        mb-1
                      "
                    >

                      <span>

                        Saving to:
                        {" "}
                        {selectedFolder?.name}

                      </span>


                      <span>

                        {Math.round(
                          saveProgress
                        )}

                        %

                      </span>

                    </div>


                    <Progress
                      value={
                        saveProgress
                      }
                      className="
                        h-2
                      "
                    />


                    {savingFile && (

                      <p
                        className="
                          text-xs
                          text-muted-foreground
                          mt-2
                          truncate
                        "
                      >
                        {savingFile}
                      </p>

                    )}

                  </div>

                )}


                {/* ==================================
                    JOB ERROR
                ================================== */}

                {job.error && (

                  <div
                    className="
                      mt-3
                      rounded-md
                      bg-red-50
                      p-3
                      text-sm
                      text-red-600
                    "
                  >
                    {job.error}
                  </div>

                )}


                {/* ==================================
                    ACTIONS
                ================================== */}

                <div
                  className="
                    mt-4
                    flex
                    flex-wrap
                    gap-2
                  "
                >

                  {/* CANCEL */}

                  {(
                    job.status ===
                      "queued" ||

                    job.status ===
                      "analyzing" ||

                    job.status ===
                      "downloading" ||

                    job.status ===
                      "processing"

                  ) && (

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        cancelDownload(
                          job.id
                        )
                      }
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <X
                        size={15}
                      />

                      Cancel

                    </Button>

                  )}


                  {/* SAVE */}

                  {job.status ===
                    "completed" && (

                    <Button
                      size="sm"
                      onClick={() =>
                        saveJob(
                          job
                        )
                      }
                      disabled={
                        savingJobId !==
                        null
                      }
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >

                      {savingJobId ===
                      job.id ? (

                        <Loader2
                          size={15}
                          className="
                            animate-spin
                          "
                        />

                      ) : (

                        <FolderOpen
                          size={15}
                        />

                      )}


                      {savingJobId ===
                      job.id
                        ? "Saving..."
                        : "Choose Folder & Save"}

                    </Button>

                  )}

                </div>


                {/* ==================================
                    FILE LIST
                ================================== */}

                {job.files &&
                  job.files.length > 0 && (

                  <div
                    className="
                      mt-5
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        mb-2
                      "
                    >

                      <FileVideo
                        size={16}
                      />

                      <span
                        className="
                          font-medium
                          text-sm
                        "
                      >

                        Downloaded Files
                        {" "}
                        ({job.files.length})

                      </span>

                    </div>


                    <div
                      className="
                        space-y-1
                        max-h-60
                        overflow-y-auto
                      "
                    >

                      {job.files.map(
                        (
                          file: DownloadedFile,
                          index
                        ) => (

                          <div
                            key={
                              `${file.id}-${index}`
                            }
                            className="
                              flex
                              items-center
                              gap-2
                              text-xs
                              p-2
                              rounded
                              bg-muted
                            "
                          >

                            <span
                              className="
                                w-8
                                text-muted-foreground
                              "
                            >

                              {file.index}

                            </span>


                            <span
                              className="
                                flex-1
                                truncate
                              "
                            >

                              {file.filename}

                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

              </CardContent>

            </Card>

          )
        )}

      </div>

    </div>
  );
};


export default Downloads;