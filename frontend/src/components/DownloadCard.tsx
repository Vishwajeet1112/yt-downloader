import React from "react";

import {
  FolderOpen,
  X,
  RotateCcw,
  Pause,
  Loader2,
  FileVideo,
} from "lucide-react";

import {
  DownloadJob,
} from "../types";

import {
  Card,
  CardContent,
} from "./ui/card";

import {
  Button,
} from "./ui/button";

import {
  Progress,
} from "./ui/progress";

import {
  cancelJob,
  retryJob,
  removeJob,
} from "../services/api";


interface DownloadCardProps {
  job: DownloadJob;

  /*
  Optional callback.
  Downloads page can use this to open
  the browser folder-selection system.
  */
  onSave?: (
    job: DownloadJob
  ) => void;
}


/*
==================================================
STATUS COLOR
==================================================
*/

const getStatusColor = (
  status: DownloadJob["status"]
) => {

  switch (status) {

    case "queued":
      return "bg-yellow-500";

    case "analyzing":
      return "bg-blue-500";

    case "downloading":
      return "bg-blue-600";

    case "completed":
      return "bg-green-500";

    case "failed":
      return "bg-red-500";

    case "cancelled":
      return "bg-gray-500";

    default:
      return "bg-gray-300";
  }
};


/*
==================================================
DOWNLOAD CARD
==================================================
*/

const DownloadCard:
  React.FC<DownloadCardProps> =
  ({
    job,
    onSave,
  }) => {


    /*
    ==============================================
    CANCEL
    ==============================================
    */

    const handleCancel =
      async () => {

        try {

          await cancelJob(
            job.id
          );

        } catch (
          error
        ) {

          console.error(
            "Cancel job error:",
            error
          );

        }

      };


    /*
    ==============================================
    RETRY
    ==============================================
    */

    const handleRetry =
      async () => {

        try {

          await retryJob(
            job.id
          );

        } catch (
          error
        ) {

          console.error(
            "Retry job error:",
            error
          );

        }

      };


    /*
    ==============================================
    REMOVE
    ==============================================
    */

    const handleRemove =
      async () => {

        try {

          await removeJob(
            job.id
          );

        } catch (
          error
        ) {

          console.error(
            "Remove job error:",
            error
          );

        }

      };


    /*
    ==============================================
    TITLE
    ==============================================
    
    DownloadJob does NOT have `title`.
    
    Use:
      currentTitle
      filename
    ==============================================
    */

    const title =
      job.currentTitle ||
      job.filename ||
      "Unknown";


    /*
    ==============================================
    QUALITY
    ==============================================
    
    DownloadJob does NOT have `format`.
    
    Use `quality`.
    ==============================================
    */

    const quality =
      job.quality ||
      "best";


    /*
    ==============================================
    FILE NAME
    ==============================================
    */

    const filename =
      job.filename ||
      "Downloaded file";


    /*
    ==============================================
    STATUS COLOR
    ==============================================
    */

    const statusColor =
      getStatusColor(
        job.status
      );


    /*
    ==============================================
    PROGRESS
    ==============================================
    */

    const progress =
      Number(
        job.progress || 0
      );


    /*
    ==============================================
    RENDER
    ==============================================
    */

    return (

      <Card>

        <CardContent
          className="
            p-4
            flex
            items-start
            gap-4
          "
        >

          {/* ==================================
              FILE ICON
          ================================== */}

          <div
            className="
              shrink-0
              pt-1
            "
          >

            <div
              className="
                h-10
                w-10
                rounded-lg
                border
                flex
                items-center
                justify-center
              "
            >

              <FileVideo
                size={20}
              />

            </div>

          </div>


          {/* ==================================
              MAIN CONTENT
          ================================== */}

          <div
            className="
              flex-1
              min-w-0
            "
          >

            {/* TITLE */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <span
                className={`
                  h-3
                  w-3
                  rounded-full
                  shrink-0
                  ${statusColor}
                `}
              />


              <span
                className="
                  font-medium
                  truncate
                "
                title={title}
              >

                {title}

              </span>

            </div>


            {/* URL + QUALITY */}

            <div
              className="
                text-sm
                text-muted-foreground
                mt-1
                break-all
              "
            >

              <span>
                {job.url}
              </span>


              <span>
                {" • "}
              </span>


              <span>
                {quality}
              </span>

            </div>


            {/* ==================================
                PROGRESS
            ================================== */}

            <div
              className="
                mt-3
              "
            >

              <Progress
                value={
                  Math.min(
                    100,
                    Math.max(
                      0,
                      progress
                    )
                  )
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
                  mt-1
                  gap-2
                "
              >

                <span>
                  {progress.toFixed(1)}%
                </span>


                <span>
                  {job.downloaded ||
                    "0 B"}
                </span>


                {job.speed &&
                  job.speed !== "—" && (

                    <span>
                      {job.speed}
                    </span>

                  )}


                {job.eta &&
                  job.eta !== "—" && (

                    <span>
                      ETA {job.eta}
                    </span>

                  )}

              </div>

            </div>


            {/* ==================================
                PLAYLIST INFORMATION
            ================================== */}

            {job.isPlaylist && (

              <div
                className="
                  mt-3
                  rounded-md
                  bg-muted
                  p-3
                  text-xs
                "
              >

                <div
                  className="
                    flex
                    flex-wrap
                    gap-4
                  "
                >

                  <span>

                    Playlist:

                    {" "}

                    <strong>
                      {job.currentVideo || 0}
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

                  <div
                    className="
                      mt-1
                      text-muted-foreground
                      truncate
                    "
                  >

                    Current:

                    {" "}

                    {job.currentTitle}

                  </div>

                )}

              </div>

            )}


            {/* ==================================
                ERROR
            ================================== */}

            {job.error && (

              <div
                className="
                  mt-2
                  text-red-500
                  text-sm
                "
              >

                {job.error}

              </div>

            )}


            {/* ==================================
                FILE PATH
            ================================== */}

            {job.status ===
              "completed" &&
              job.filePath && (

                <div
                  className="
                    mt-2
                    text-xs
                    text-muted-foreground
                    truncate
                  "
                  title={
                    job.filePath
                  }
                >

                  Server file:

                  {" "}

                  {job.filePath}

                </div>

              )}


            {/* ==================================
                FILES
            ================================== */}

            {job.files &&
              job.files.length > 0 && (

                <div
                  className="
                    mt-3
                    space-y-1
                  "
                >

                  <div
                    className="
                      text-xs
                      font-medium
                    "
                  >

                    Files:

                    {" "}

                    {job.files.length}

                  </div>


                  <div
                    className="
                      max-h-32
                      overflow-y-auto
                      space-y-1
                    "
                  >

                    {job.files.map(
                      (
                        file
                      ) => (

                        <div
                          key={
                            `${file.id}-${file.index}`
                          }
                          className="
                            text-xs
                            text-muted-foreground
                            truncate
                          "
                        >

                          {file.index}.

                          {" "}

                          {file.filename}

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

          </div>


          {/* ==================================
              ACTIONS
          ================================== */}

          <div
            className="
              flex
              gap-2
              shrink-0
            "
          >

            {/* ==================================
                DOWNLOADING
            ================================== */}

            {(
              job.status ===
                "queued" ||

              job.status ===
                "analyzing" ||

              job.status ===
                "downloading"

            ) && (

              <Button
                variant="outline"
                size="sm"
                onClick={
                  handleCancel
                }
                title="Cancel download"
              >

                <Pause
                  size={16}
                />

              </Button>

            )}


            {/* ==================================
                PROCESSING
            ================================== */}

            {job.status ===
              "processing" && (

                <Button
                  variant="outline"
                  size="sm"
                  disabled
                >

                  <Loader2
                    size={16}
                    className="
                      animate-spin
                    "
                  />

                </Button>

              )}


            {/* ==================================
                RETRY
            ================================== */}

            {(
              job.status ===
                "failed" ||

              job.status ===
                "cancelled"

            ) && (

              <Button
                variant="outline"
                size="sm"
                onClick={
                  handleRetry
                }
                title="Retry download"
              >

                <RotateCcw
                  size={16}
                />

              </Button>

            )}


            {/* ==================================
                SAVE COMPLETED FILE
            ================================== */}

            {job.status ===
              "completed" && (

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {

                    if (
                      onSave
                    ) {

                      onSave(
                        job
                      );

                    }

                  }}
                  disabled={
                    !onSave
                  }
                  title={
                    onSave
                      ? "Choose folder and save"
                      : filename
                  }
                >

                  <FolderOpen
                    size={16}
                  />

                </Button>

            )}


            {/* ==================================
                REMOVE
            ================================== */}

            <Button
              variant="destructive"
              size="sm"
              onClick={
                handleRemove
              }
              title="Remove job"
            >

              <X
                size={16}
              />

            </Button>

          </div>

        </CardContent>

      </Card>
    );
  };


export default DownloadCard;