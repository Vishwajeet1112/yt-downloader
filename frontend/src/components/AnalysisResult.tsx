import React from "react";
import {
  Download,
  Eye,
  Calendar,
  Clock,
  User,
} from "lucide-react";

import type {
  VideoInfo,
} from "../types";

interface AnalysisResultProps {
  info: VideoInfo;

  selectedFormat: string;

  onFormatChange: (
    format: string
  ) => void;

  onDownload: () => void;
}

const formatDuration = (
  seconds?: number
): string => {
  if (
    !seconds ||
    seconds <= 0
  ) {
    return "Unknown";
  }

  const hours =
    Math.floor(seconds / 3600);

  const minutes =
    Math.floor(
      (seconds % 3600) / 60
    );

  const secs =
    seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }

  return `${minutes}m ${secs}s`;
};

const formatViews = (
  views?: number
): string => {
  if (
    typeof views !== "number"
  ) {
    return "0";
  }

  return views.toLocaleString();
};

const formatDate = (
  date?: string
): string => {
  if (!date) {
    return "Unknown";
  }

  if (
    /^\d{8}$/.test(date)
  ) {
    return `${date.slice(
      0,
      4
    )}-${date.slice(
      4,
      6
    )}-${date.slice(6, 8)}`;
  }

  return date;
};

const AnalysisResult: React.FC<
  AnalysisResultProps
> = ({
  info,
  selectedFormat,
  onFormatChange,
  onDownload,
}) => {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">

      {/* Thumbnail */}

      {info.thumbnail && (
        <img
          src={info.thumbnail}
          alt={
            info.title ||
            "Video thumbnail"
          }
          className="aspect-video w-full object-cover"
        />
      )}

      {/* Content */}

      <div className="space-y-5 p-5">

        <div>
          <h2 className="text-xl font-bold text-white">
            {info.title ||
              "Unknown title"}
          </h2>

          {info.uploader && (
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
              <User size={16} />

              <span>
                {info.uploader}
              </span>
            </div>
          )}
        </div>

        {/* Video information */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

          <div className="flex items-center gap-2 rounded-lg bg-slate-800 p-3 text-sm text-slate-300">
            <Clock size={16} />

            <span>
              {formatDuration(
                info.duration_seconds ??
                  info.duration
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-800 p-3 text-sm text-slate-300">
            <Calendar size={16} />

            <span>
              {formatDate(
                info.upload_date
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-800 p-3 text-sm text-slate-300">
            <Eye size={16} />

            <span>
              {formatViews(
                info.view_count
              )}
            </span>
          </div>

        </div>

        {/* Quality */}

        <div>
          <label
            htmlFor="quality"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Download Quality
          </label>

          <select
            id="quality"
            value={
              selectedFormat ||
              "best"
            }
            onChange={(event) =>
              onFormatChange(
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
          >
            <option value="best">
              Best Quality
            </option>

            <option value="4k">
              4K
            </option>

            <option value="1080">
              1080p
            </option>

            <option value="720">
              720p
            </option>

            <option value="480">
              480p
            </option>

            <option value="360">
              360p
            </option>

            <option value="audio">
              Audio MP3
            </option>
          </select>
        </div>

        {/* Download */}

        <button
          type="button"
          onClick={onDownload}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <Download size={18} />

          Download
        </button>

      </div>
    </div>
  );
};

export default AnalysisResult;