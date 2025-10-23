"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface DreamData {
  id: string;
  rawText: string | null;
  summary: string | null;
  emotion: string | null;
  visibility: "PRIVATE" | "SHARED" | "WORLD";
}

const visibilityCopy: Record<DreamData["visibility"], string> = {
  PRIVATE: "Only you can revisit this vision.",
  SHARED: "Linked dreamers you invite may explore it.",
  WORLD: "Offer it to the collective atlas.",
};

export default function DreamEditForm({ dream }: { dream: DreamData }) {
  const [rawText, setRawText] = useState(dream.rawText || "");
  const [summary, setSummary] = useState(dream.summary || "");
  const [emotion, setEmotion] = useState(dream.emotion || "");
  const [visibility, setVisibility] = useState(dream.visibility);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    const response = await fetch(`/api/dreams/${dream.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText, summary, emotion, visibility }),
    });

    if (response.ok) {
      setFeedback("Dream updated successfully.");
    } else {
      setFeedback("We could not rewrite this dream. Please try again.");
    }

    setSaving(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/6 p-8 backdrop-blur"
    >
      <Input
        label="Dream Glyph"
        value={summary}
        onChange={(event) => setSummary(event.target.value)}
        placeholder="What will you call this vision?"
      />

      <label className="flex flex-col gap-3 text-xs uppercase tracking-[0.35em] text-white/40">
        <span>Raw narrative</span>
        <textarea
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          className="min-h-[220px] rounded-2xl border border-white/12 bg-white/8 px-5 py-4 text-sm leading-relaxed text-white/80 backdrop-blur transition placeholder:text-white/30 focus:border-white/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
          placeholder="Rewrite, expand, or refine the memory."
        />
      </label>

      <Input
        label="Dominant emotion"
        value={emotion}
        onChange={(event) => setEmotion(event.target.value)}
        placeholder="e.g. awe, dread, curiosity"
      />

      <label className="flex flex-col gap-3 rounded-2xl border border-white/12 bg-white/6 px-5 py-4 text-xs uppercase tracking-[0.35em] text-white/40 backdrop-blur">
        <span>Visibility</span>
        <select
          value={visibility}
          onChange={(event) =>
            setVisibility(event.target.value as DreamData["visibility"])
          }
          className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-white/35 focus-visible:ring-2 focus-visible:ring-fuchsia-500"
        >
          <option value="PRIVATE">Private</option>
          <option value="SHARED">Shared</option>
          <option value="WORLD">World</option>
        </select>
        <span className="text-[10px] lowercase tracking-[0.35em] text-white/45">
          {visibilityCopy[visibility]}
        </span>
      </label>

      {feedback && (
        <p className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/75">
          {feedback}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving..." : "Update Dream"}
        </Button>
      </div>
    </form>
  );
}
