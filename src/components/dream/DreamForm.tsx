/* eslint-disable @next/next/no-img-element */
"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type MediaKind = "AUDIO" | "IMAGE" | "SKETCH";

type MediaFile = {
  file: File;
  kind: MediaKind;
  preview?: string;
};

const UPLOAD_OPTIONS: Array<{
  label: string;
  accept: string;
  kind: MediaKind;
  gradient: string;
}> = [
  {
    label: "Image",
    accept: "image/*",
    kind: "IMAGE",
    gradient: "from-sky-400/20 via-indigo-500/20 to-fuchsia-500/25",
  },
  {
    label: "Audio",
    accept: "audio/*",
    kind: "AUDIO",
    gradient: "from-fuchsia-500/20 via-rose-500/20 to-amber-400/20",
  },
  {
    label: "Sketch",
    accept: "image/*",
    kind: "SKETCH",
    gradient: "from-emerald-400/20 via-teal-400/20 to-cyan-400/20",
  },
];

const visibilityCopy: Record<"PRIVATE" | "WORLD", string> = {
  PRIVATE: "Keep dream in your personal atlas",
  WORLD: "Let the collective gaze upon this vision",
};

const cleanupPreviews = (files: MediaFile[]) => {
  files.forEach((entry) => {
    if (entry.preview) {
      URL.revokeObjectURL(entry.preview);
    }
  });
};

export default function DreamForm() {
  const [summary, setSummary] = useState("");
  const [rawText, setRawText] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "WORLD">("PRIVATE");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      cleanupPreviews(mediaFiles);
    };
  }, [mediaFiles]);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    kind: MediaKind,
  ) => {
    if (!event.target.files) return;

    const nextFiles = Array.from(event.target.files).map((file) => ({
      file,
      kind,
      preview: kind === "AUDIO" ? undefined : URL.createObjectURL(file),
    }));

    setMediaFiles((prev) => [...prev, ...nextFiles]);
    event.target.value = "";
  };

  const removeMediaAt = (index: number) => {
    setMediaFiles((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return next;
    });
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("summary", summary);
      formData.append("rawText", rawText);
      formData.append("visibility", visibility);
      mediaFiles.forEach((entry, index) =>
        formData.append(`mediaFiles[${index}]`, entry.file),
      );

      const response = await fetch("/api/dreams/new", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Failed to save dream.");
      }

      cleanupPreviews(mediaFiles);
      setSummary("");
      setRawText("");
      setMediaFiles([]);
      setVisibility("PRIVATE");
      window.location.href = "/dashboard";
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected dream drift.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Input
        label="Dream Glyph"
        placeholder="A title or phrase that encapsulates the vision"
        value={summary}
        onChange={(event) => setSummary(event.target.value)}
      />

      <label className="group flex flex-col gap-3 text-xs uppercase tracking-[0.35em] text-white/40">
        <span>Raw narrative</span>
        <textarea
          placeholder="Describe your dream in luxuriant detail..."
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          className="min-h-[200px] rounded-2xl border border-white/12 bg-white/8 px-5 py-4 text-sm leading-relaxed text-white/80 backdrop-blur transition placeholder:text-white/30 focus:border-white/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
        />
      </label>

      <div className="grid gap-4 lg:grid-cols-3">
        {UPLOAD_OPTIONS.map((option) => (
          <label
            key={option.label}
            className={`
              group relative flex cursor-pointer flex-col gap-3 rounded-2xl border border-white/12
              bg-gradient-to-br ${option.gradient} px-4 py-4 text-white/80 backdrop-blur transition
              hover:border-white/35 hover:shadow-[0_30px_70px_rgba(168,85,247,0.18)]
            `}
          >
            <input
              type="file"
              accept={option.accept}
              onChange={(event) => handleFileChange(event, option.kind)}
              className="hidden"
            />
            <span className="text-xs uppercase tracking-[0.35em] text-white/50">
              Attach {option.label}
            </span>
            <span className="text-sm leading-snug text-white/75">
              Drop in {option.label.toLowerCase()} fragments that echo the dream.
            </span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/45">
              Click to add
            </span>
          </label>
        ))}
      </div>

      {mediaFiles.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <span className="text-xs uppercase tracking-[0.35em] text-white/40">
            Attached artifacts
          </span>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {mediaFiles.map((entry, index) => (
              <div
                key={`${entry.file.name}-${index}`}
                className="relative overflow-hidden rounded-xl border border-white/12 bg-white/8"
              >
                {entry.kind === "AUDIO" ? (
                  <div className="flex h-28 flex-col items-center justify-center gap-2 px-4 text-center text-xs uppercase tracking-[0.3em] text-white/65">
                    <span>Audio Sigil</span>
                    <span className="truncate text-[10px] lowercase text-white/45">
                      {entry.file.name}
                    </span>
                  </div>
                ) : (
                  <img
                    src={entry.preview}
                    alt={entry.file.name}
                    className="h-40 w-full object-cover"
                  />
                )}

                <button
                  type="button"
                  onClick={() => removeMediaAt(index)}
                  className="absolute right-2 top-2 rounded-full border border-white/20 bg-black/40 px-2 py-1 text-[10px] uppercase tracking-[0.35em] text-white/70 backdrop-blur hover:border-white/40 hover:text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <label className="flex flex-col gap-3 rounded-2xl border border-white/12 bg-white/6 px-5 py-4 text-xs uppercase tracking-[0.35em] text-white/40 backdrop-blur">
          <span>Dream visibility</span>
          <select
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as "PRIVATE" | "WORLD")
            }
            className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/35 focus-visible:ring-2 focus-visible:ring-fuchsia-500"
          >
            <option value="PRIVATE">Private vault</option>
            <option value="WORLD">Share with collective</option>
          </select>
          <span className="text-[10px] lowercase tracking-[0.35em] text-white/45">
            {visibilityCopy[visibility]}
          </span>
        </label>

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/12 bg-white/4 px-5 py-4 text-white/70 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            Dream sharing pledge
          </p>
          <p className="text-sm leading-relaxed text-white/70">
            Every detail deepens the atlas. Share only what resonates, and we
            will weave the rest into luminous constellations.
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} intent="primary" size="lg">
          {loading ? "Recording..." : "Save Dream"}
        </Button>
      </div>
    </form>
  );
}
