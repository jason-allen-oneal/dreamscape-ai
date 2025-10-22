"use client";
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type MediaFile = {
  file: File;
  kind: "AUDIO" | "IMAGE" | "SKETCH";
  preview?: string;
};

export default function DreamForm() {
  const [summary, setSummary] = useState("");
  const [rawText, setRawText] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "WORLD">("PRIVATE");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, kind: MediaFile["kind"]) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => ({
        file,
        kind,
        preview: kind !== "AUDIO" ? URL.createObjectURL(file) : undefined,
      }));
      setMediaFiles(prev => [...prev, ...filesArray]);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("summary", summary);
      formData.append("rawText", rawText);
      formData.append("visibility", visibility);
      mediaFiles.forEach((m, i) => formData.append(`mediaFiles[${i}]`, m.file));

      const res = await fetch("/api/dreams/new", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save dream.");
        setLoading(false);
        return;
      }

      // Reset form or navigate
      setSummary("");
      setRawText("");
      setMediaFiles([]);
      setVisibility("PRIVATE");
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unexpected error");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Dream Summary / Title"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="A short summary of your dream"
      />

      <textarea
        placeholder="Describe your dream in detail..."
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-gray-200 focus:ring-2 focus:ring-fuchsia-500 outline-none h-40"
      />

      <div className="flex gap-2 flex-wrap">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "IMAGE")}
            className="hidden"
          />
          <span className="px-3 py-1 bg-indigo-700 rounded-lg text-sm hover:bg-indigo-600 transition">Add Image</span>
        </label>

        <label className="cursor-pointer">
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => handleFileChange(e, "AUDIO")}
            className="hidden"
          />
          <span className="px-3 py-1 bg-fuchsia-700 rounded-lg text-sm hover:bg-fuchsia-600 transition">Add Audio</span>
        </label>

        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "SKETCH")}
            className="hidden"
          />
          <span className="px-3 py-1 bg-violet-700 rounded-lg text-sm hover:bg-violet-600 transition">Add Sketch</span>
        </label>
      </div>

      {mediaFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {mediaFiles.map((m, i) => (
            <div key={i} className="relative w-20 h-20 bg-slate-700 rounded overflow-hidden flex items-center justify-center">
              {m.kind === "AUDIO" ? (
                <span className="text-xs text-gray-200">{m.file.name}</span>
              ) : (
                <img src={m.preview} alt={m.file.name} className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}

      <select
        value={visibility}
        onChange={(e) => setVisibility(e.target.value as "PRIVATE" | "WORLD")}
        className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-gray-200 focus:ring-2 focus:ring-fuchsia-500 outline-none"
      >
        <option value="PRIVATE">Private</option>
        <option value="WORLD">Share with Collective</option>
      </select>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Dream"}
      </Button>
    </form>
  );
}
