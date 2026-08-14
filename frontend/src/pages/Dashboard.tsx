import React, {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import { z } from "zod";

import {
  FolderOpen,
} from "lucide-react";

import UrlInput from "../components/UrlInput";

import AnalysisResult from "../components/AnalysisResult";

import {
  analyzeUrl,
  addDownload,
} from "../services/api";

import type {
  VideoInfo,
  DownloadQuality,
} from "../types";


const schema = z.object({
  urls: z
    .array(z.string())
    .min(
      1,
      "Please paste at least one URL"
    ),
});


const Dashboard: React.FC =
  () => {

    const [
      urls,
      setUrls,
    ] = useState<string[]>([]);

    const [
      analysis,
      setAnalysis,
    ] = useState<VideoInfo | null>(
      null
    );

    const [
      loading,
      setLoading,
    ] = useState(false);

    const [
      selectedFormat,
      setSelectedFormat,
    ] = useState<DownloadQuality>(
      "best"
    );

    const [
      error,
      setError,
    ] = useState<string | null>(
      null
    );

    const [
      selectedFolder,
      setSelectedFolder,
    ] = useState<any>(null);

    const navigate =
      useNavigate();


    /*
    ==============================================
    CHOOSE DOWNLOAD FOLDER
    ==============================================
    */

    const chooseFolder =
      async (): Promise<boolean> => {

        setError(null);

        if (
          !(
            "showDirectoryPicker" in
            window
          )
        ) {

          setError(
            "Folder selection is not supported. Please use Google Chrome or Microsoft Edge."
          );

          return false;
        }

        try {

          const directory =
            await (
              window as any
            ).showDirectoryPicker({
              mode: "readwrite",
            });

          setSelectedFolder(
            directory
          );

          return true;

        } catch {

          return false;
        }
      };


    /*
    ==============================================
    ANALYZE
    ==============================================
    */

    const handleAnalyze =
      async (
        inputUrls: string[]
      ) => {

        if (
          inputUrls.length === 0
        ) {
          return;
        }

        setUrls(
          inputUrls
        );

        setLoading(
          true
        );

        setError(
          null
        );

        setAnalysis(
          null
        );

        try {

          schema.parse({
            urls: inputUrls,
          });

          const info =
            await analyzeUrl(
              inputUrls[0]
            );

          setAnalysis(
            info
          );

        } catch (
          err: any
        ) {

          console.error(
            "Analyze error:",
            err
          );

          setError(
            err?.response?.data?.error ||
            err?.message ||
            "Unable to analyze video."
          );

        } finally {

          setLoading(
            false
          );
        }
      };


    /*
    ==============================================
    DOWNLOAD
    ==============================================
    */

    const handleDownload =
      async () => {

        if (!analysis) {

          setError(
            "Please analyze a video first."
          );

          return;
        }

        if (
          urls.length === 0
        ) {

          setError(
            "YouTube URL is missing."
          );

          return;
        }


        /*
        ------------------------------------------
        ASK FOR FOLDER BEFORE DOWNLOAD
        ------------------------------------------
        */

        let folder =
          selectedFolder;

        if (!folder) {

          const selected =
            await chooseFolder();

          if (!selected) {

            setError(
              "Please select a folder before downloading."
            );

            return;
          }

          /*
          chooseFolder() updates React state
          asynchronously, so we cannot use
          selectedFolder immediately here.
          Ask user to select again is avoided
          by directly selecting the handle.
          */

          try {

            folder =
              await (
                window as any
              ).showDirectoryPicker({
                mode: "readwrite",
              });

            setSelectedFolder(
              folder
            );

          } catch {

            setError(
              "Folder selection cancelled."
            );

            return;
          }
        }


        setError(null);


        try {

          const job =
            await addDownload(
              urls[0],
              selectedFormat
            );


          console.log(
            "Download started:",
            job
          );


          /*
          Store selected folder temporarily
          for Downloads page.
          */

          (
            window as any
          ).ytDownloadFolder =
            folder;


          navigate(
            "/downloads"
          );

        } catch (
          err: any
        ) {

          console.error(
            "Download error:",
            err
          );

          setError(
            err?.response?.data?.error ||
            err?.message ||
            "Unable to start download."
          );
        }
      };


    return (

      <div className="space-y-6">

        <div>

          <h1
            className="
              text-4xl
              font-bold
            "
          >
            Download videos
            without the
            command line
          </h1>

          <p
            className="
              text-muted-foreground
            "
          >
            Fast, simple and
            powerful yt-dlp
            interface.
          </p>

        </div>


        <UrlInput
          onAnalyze={
            handleAnalyze
          }
        />


        {loading && (

          <div
            className="
              rounded-lg
              border
              p-4
              text-center
            "
          >
            Analyzing video...
          </div>

        )}


        {error && (

          <div
            className="
              rounded-lg
              border
              border-red-500/30
              bg-red-500/10
              p-4
              text-sm
              text-red-500
            "
          >
            {error}
          </div>

        )}


        {analysis &&
          !loading && (

            <>

              {/* =================================
                  SELECT DOWNLOAD FOLDER
              ================================= */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  rounded-lg
                  border
                  p-4
                "
              >

                <div>

                  <p
                    className="
                      font-semibold
                    "
                  >
                    Download Location
                  </p>

                  <p
                    className="
                      text-sm
                      text-muted-foreground
                    "
                  >
                    {selectedFolder
                      ? `Selected folder: ${selectedFolder.name}`
                      : "Choose where you want to save the downloaded file."
                    }
                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    chooseFolder
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-md
                    border
                    px-4
                    py-2
                    text-sm
                    hover:bg-muted
                  "
                >

                  <FolderOpen
                    size={16}
                  />

                  {selectedFolder
                    ? "Change Folder"
                    : "Choose Folder"
                  }

                </button>

              </div>


              <AnalysisResult

                info={
                  analysis
                }

                selectedFormat={
                  selectedFormat
                }

                onFormatChange={
                  (
                    value: string
                  ) => {

                    const allowed:
                      DownloadQuality[] =
                      [
                        "best",
                        "4k",
                        "1080",
                        "720",
                        "480",
                        "360",
                        "audio",
                      ];

                    if (
                      allowed.includes(
                        value as DownloadQuality
                      )
                    ) {

                      setSelectedFormat(
                        value as DownloadQuality
                      );
                    }
                  }
                }

                onDownload={
                  handleDownload
                }

              />

            </>

          )}

      </div>
    );
  };


export default Dashboard;