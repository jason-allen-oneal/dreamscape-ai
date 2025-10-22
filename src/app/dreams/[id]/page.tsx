"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function DreamDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [dream, setDream] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/dreams/${id}`)
      .then(res => res.json())
      .then(data => {
        setDream(data);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this dream?")) return;
    try {
      await fetch(`/api/dreams/${dream.id}`, { method: "DELETE" });
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to delete dream:", err);
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#060318] via-[#0a0626] to-[#0e0a3a] text-white">
        <p>Loading dream...</p>
      </main>
    );
  }

  if (!dream) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen text-white bg-gradient-to-b from-[#060318] via-[#0a0626] to-[#0e0a3a]">
        <p>Dream not found.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 px-5 py-2 bg-fuchsia-600 rounded-lg hover:bg-fuchsia-500 transition font-semibold"
        >
          Return to Dashboard
        </button>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen text-white overflow-hidden bg-gradient-to-b from-[#060318] via-[#0a0626] to-[#0e0a3a] p-6 sm:p-10">
      {/* Action Buttons */}
      <div className="flex justify-end gap-4 max-w-3xl mx-auto mb-6">
        <button
          onClick={() => router.push(`/dashboard/dreams/${dream.id}/edit`)}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-md transition"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-semibold shadow-md transition"
        >
          Delete
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-3xl mx-auto bg-slate-900/60 p-10 rounded-2xl border border-slate-800 backdrop-blur-lg shadow-xl"
      >
        <h1 className="text-3xl font-extrabold mb-4 text-fuchsia-300">
          {dream.summary || "Untitled Dream"}
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          {new Date(dream.createdAt).toLocaleString()}
        </p>
        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{dream.rawText}</p>

        {dream.mediaItems?.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dream.mediaItems.map((m: any) => (
              <img
                key={m.id}
                src={m.url}
                alt=""
                className="rounded-lg border border-slate-700 object-cover w-full h-48"
              />
            ))}
          </div>
        )}
      </motion.div>
    </main>
  );
}
