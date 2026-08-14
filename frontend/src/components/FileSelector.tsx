import React, { useState } from "react";

interface DownloadFile {
  id: string;
  filename: string;
  url: string;
  type?: "video" | "audio";
  size?: string;
}

interface FileSelectorProps {
  files: DownloadFile[];
  onDownloadSelected: (files: DownloadFile[]) => void;
}

export default function FileSelector({
  files,
  onDownloadSelected,
}: FileSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleFile = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(files.map((file) => file.id));
  };

  const clearAll = () => {
    setSelected([]);
  };

  const downloadSelected = () => {
    const selectedFiles = files.filter((file) =>
      selected.includes(file.id)
    );

    onDownloadSelected(selectedFiles);
  };

  return (
    <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">
            Select Files
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Select the files you want to download
          </p>
        </div>

        <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
          {selected.length} selected
        </span>
      </div>

      <div className="space-y-3">
        {files.map((file) => {
          const isSelected = selected.includes(file.id);

          return (
            <label
              key={file.id}
              className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                isSelected
                  ? "border-green-500 bg-green-500/10"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() =>
                  toggleFile(file.id)
                }
                className="h-5 w-5"
              />

              <div className="flex-1">
                <p className="font-medium text-white">
                  {file.filename}
                </p>

                <div className="mt-1 flex gap-4 text-sm text-slate-400">
                  {file.type && (
                    <span>
                      {file.type.toUpperCase()}
                    </span>
                  )}

                  {file.size && (
                    <span>
                      {file.size}
                    </span>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={selectAll}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
        >
          Select All
        </button>

        <button
          onClick={clearAll}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
        >
          Clear
        </button>

        <button
          onClick={downloadSelected}
          disabled={selected.length === 0}
          className="ml-auto rounded-lg bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ⬇ Download Selected
        </button>
      </div>
    </div>
  );
}