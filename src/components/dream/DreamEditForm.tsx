"use client";
import { useState } from "react";

interface DreamData {
  id: string;
  rawText: string | null;
  summary: string | null;
  emotion: string | null;
  visibility: "PRIVATE" | "SHARED" | "WORLD";
}

export default function DreamEditForm({ dream }: { dream: DreamData }) {
  const [rawText, setRawText] = useState(dream.rawText || "");
  const [summary, setSummary] = useState(dream.summary || "");
  const [emotion, setEmotion] = useState(dream.emotion || "");
  const [visibility, setVisibility] = useState(dream.visibility);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Call API route to update the dream
    const res = await fetch(`/api/dreams/${dream.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText, summary, emotion, visibility }),
    });

    if (res.ok) {
      alert("Dream updated successfully!");
    } else {
      alert("Failed to update dream.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl">
      <label>
        Raw Text
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
      </label>

      <label>
        Summary
        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
      </label>

      <label>
        Emotion
        <input
          type="text"
          value={emotion}
          onChange={(e) => setEmotion(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
      </label>

      <label>
        Visibility
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as DreamData["visibility"])}
          className="w-full p-2 rounded bg-gray-800 text-white"
        >
          <option value="PRIVATE">PRIVATE</option>
          <option value="SHARED">SHARED</option>
          <option value="WORLD">WORLD</option>
        </select>
      </label>

      <button
        type="submit"
        className="bg-fuchsia-500 hover:bg-fuchsia-600 transition-colors rounded p-2 text-white font-bold"
      >
        Save
      </button>
    </form>
  );
}
