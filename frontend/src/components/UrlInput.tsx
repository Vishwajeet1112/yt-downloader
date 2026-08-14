import React, { useState } from "react";

import {
  Play,
  Plus,
} from "lucide-react";

import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface UrlInputProps {
  onAnalyze: (
    urls: string[]
  ) => void;
}

const UrlInput: React.FC<
  UrlInputProps
> = ({ onAnalyze }) => {

  const [text, setText] =
    useState("");

  const handleAnalyze = () => {

    const lines = text
      .split("\n")
      .map((line) =>
        line.trim()
      )
      .filter(
        (line) => line.length > 0
      );

    if (lines.length > 0) {
      onAnalyze(lines);
    }
  };

  const urlCount = text
    .split("\n")
    .filter(
      (line) =>
        line.trim().length > 0
    ).length;

  return (
    <div className="space-y-2">

      <Textarea
        placeholder="Paste YouTube or supported media URL (one per line)..."
        value={text}
        onChange={(e) =>
          setText(e.target.value)
        }
        rows={4}
        className="resize-none"
      />

      <div className="flex gap-2">

        {/* Analyze */}

        <Button
          onClick={
            handleAnalyze
          }
          disabled={
            urlCount === 0
          }
          className="flex items-center gap-2"
        >
          <Play size={16} />

          Analyze
        </Button>

        {/* Add to Queue */}

        <Button
          type="button"
          variant="outline"
          disabled={
            urlCount === 0
          }
          className="flex items-center gap-2"
        >
          <Plus size={16} />

          Add to Queue
        </Button>

      </div>

      {/* URL counter */}

      <div className="text-sm text-muted-foreground">
        {urlCount}{" "}
        {urlCount === 1
          ? "URL"
          : "URLs"}{" "}
        detected
      </div>

    </div>
  );
};

export default UrlInput;