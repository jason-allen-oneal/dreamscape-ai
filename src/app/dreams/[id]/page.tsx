"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SpectralBackdrop } from "@/components/layout/SpectralBackdrop";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

interface DreamMedia {
  id: string;
  url: string;
  description?: string | null;
}

interface DreamPayload {
  id: string;
  summary: string | null;
  rawText: string;
  createdAt: string;
  emotion?: string | null;
  visibility: string;
  mediaItems?: DreamMedia[];
}

export default function DreamDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [dream, setDream] = useState<DreamPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dreams/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        setDream(data);
        setError(null);
      })
      .catch(() => setError("We could not locate that dream."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!dream) return;
    if (!confirm("Release this dream from the atlas?")) return;
    await fetch(`/api/dreams/${dream.id}`, { method: "DELETE" });
    router.replace("/dashboard");
  };

  const handleAnalyze = async () => {
    if (!dream) return;
    setAnalyzing(true);
    try {
      const response = await fetch(`/api/dreams/${dream.id}/analyze`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to analyze dream");
      const data = await response.json();
      setAnalysis(data.analysis);
      toast.success("Dream analyzed successfully.");
    } catch (err) {
      console.error(err);
      toast.error("We couldn't analyze this dream.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden text-white">
        <SpectralBackdrop className="opacity-75" />
        <p className="relative z-10 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-xs uppercase tracking-[0.4em] text-white/60 backdrop-blur">
          Summoning dream...
        </p>
      </main>
    );
  }

  if (error || !dream) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden text-white">
        <SpectralBackdrop className="opacity-75" />
        <div className="relative z-10 flex flex-col gap-4 rounded-3xl border border-white/12 bg-white/6 px-10 py-12 text-center backdrop-blur">
          <p className="text-lg font-semibold text-white/85">Signal Lost</p>
          <p className="text-sm text-white/65">{error ?? "Dream not found."}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mx-auto rounded-full border border-white/20 bg-white/10 px-6 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-white/35 hover:bg-white/15"
          >
            Return to dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden px-6 py-16 text-white">
      <SpectralBackdrop className="opacity-80" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">
              Dream entry
            </p>
            <h1 className="text-4xl font-semibold text-white/90">
              {dream.summary || "Untitled Dream"}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/45">
              <span>{new Date(dream.createdAt).toLocaleString()}</span>
              <span>•</span>
              <span>{dream.visibility.toLowerCase()} realm</span>
              {dream.emotion && (
                <>
                  <span>•</span>
                  <span>{dream.emotion.toLowerCase()} tone</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? "Analyzing..." : "Analyze Dream"}
            </Button>
            <Button
              type="button"
              intent="secondary"
              onClick={() => router.push(`/dashboard/dreams/${dream.id}/edit`)}
            >
              Edit Dream
            </Button>
            <Button type="button" onClick={handleDelete}>
              Release Dream
            </Button>
          </div>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="rounded-[32px] border border-white/12 bg-white/6 p-10 text-white/80 backdrop-blur"
        >
          <p className="whitespace-pre-wrap text-base leading-relaxed text-white/75">
            {dream.rawText}
          </p>

          {dream.mediaItems && dream.mediaItems.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {dream.mediaItems.map((media) => (
                <div
                  key={media.id}
                  className="overflow-hidden rounded-2xl border border-white/12 bg-white/8"
                >
                  <Image
                    src={media.url}
                    alt={media.description ?? "Dream artifact"}
                    width={640}
                    height={320}
                    className="h-52 w-full object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
        </motion.article>

        {analysis && (
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="rounded-[32px] border border-fuchsia-500/30 bg-white/8 p-10 text-white/80 backdrop-blur"
          >
            <h2 className="mb-6 text-2xl font-semibold text-white">
              🔮 Dream Analysis
            </h2>
            <div className="dream-analysis prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="mb-4 mt-6 text-2xl font-semibold text-white/90 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mb-3 mt-5 text-xl font-semibold text-white/90 first:mt-0">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-2 mt-4 text-lg font-semibold text-white/85 first:mt-0">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 leading-relaxed text-white/75 last:mb-0">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-4 ml-6 list-disc space-y-2 text-white/75 last:mb-0">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 ml-6 list-decimal space-y-2 text-white/75 last:mb-0">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-white/90">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-white/80">{children}</em>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-fuchsia-300">
                        {children}
                      </code>
                    ) : (
                      <code className="block rounded-lg bg-black/30 p-4 font-mono text-sm text-white/90">
                        {children}
                      </code>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="my-4 border-l-4 border-fuchsia-500/50 bg-white/5 pl-4 italic text-white/70">
                      {children}
                    </blockquote>
                  ),
                  hr: () => (
                    <hr className="my-6 border-white/10" />
                  ),
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
          </motion.article>
        )}
      </div>
    </main>
  );
}
