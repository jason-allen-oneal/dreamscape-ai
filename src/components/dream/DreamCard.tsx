import { Dream, Media, DreamTag } from "@prisma/client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getEmotionTheme } from "./emotionThemes";

interface DreamCardProps {
  dream: Dream & {
    mediaItems?: Media[];
    tags?: (DreamTag & { tagDictionary: { value: string; type: string } })[];
    intensity?: number | null;
  };
}

export default function DreamCard({ dream }: DreamCardProps) {
  const router = useRouter();
  const theme = getEmotionTheme(dream.emotion || undefined);
  const motifCount = dream.tags?.length ?? 0;
  const intensity =
    typeof dream.intensity === "number"
      ? Math.round(dream.intensity * 100)
      : null;

  const handleClick = () => {
    router.push(`/dreams/${dream.id}`);
  };

  return (
    <motion.div
      className="relative cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={handleClick}
    >
      <div
        className={`
          relative overflow-hidden rounded-2xl border border-white/12
          bg-white/6 px-6 py-6 backdrop-blur-2xl transition-all duration-300
          ${theme.glow} hover:border-white/35
        `}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent"
          animate={{ x: ["-120%", "120%"] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
        />

        <div className="relative z-10 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg text-white/70">✶</span>
              <h2 className="text-xl font-semibold text-white/90 tracking-tight line-clamp-2">
                {dream.summary || "Untitled Dream"}
              </h2>
            </div>
            {dream.emotion && (
              <span
                className={`
                  rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.3em]
                  ${theme.text}
                `}
              >
                {dream.emotion.toLowerCase()}
              </span>
            )}
          </div>
          <div className="flex gap-3 text-xs uppercase tracking-[0.3em] text-white/40">
            <span>{new Date(dream.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{motifCount} motifs</span>
            {intensity !== null && (
              <>
                <span>•</span>
                <span>{intensity}% intensity</span>
              </>
            )}
          </div>
        </div>

        <p className="relative z-10 mb-4 text-sm leading-relaxed text-white/75 line-clamp-4">
          {dream.rawText}
        </p>

        {motifCount > 0 && (
          <div className="relative z-10 mb-5 flex flex-wrap gap-2">
            {dream.tags && dream.tags.slice(0, 4).map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/70 backdrop-blur"
              >
                {tag.tagDictionary.value}
              </span>
            ))}
            {motifCount > 4 && (
              <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/50">
                +{motifCount - 4} more
              </span>
            )}
          </div>
        )}

        {dream.mediaItems && dream.mediaItems.length > 0 && (
          <div className="relative z-10 grid grid-cols-2 gap-2">
            {dream.mediaItems.slice(0, 2).map((media) => (
              <div
                key={media.id}
                className="relative overflow-hidden rounded-xl border border-white/12"
              >
                <Image
                  src={media.url}
                  alt={media.description ?? "Dream media"}
                  width={320}
                  height={160}
                  className="h-24 w-full object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
              </div>
            ))}
          </div>
        )}

        <div className="absolute right-6 top-6">
          <motion.div
            className={`h-3 w-14 rounded-full bg-gradient-to-r ${theme.gradient}`}
            animate={{
              opacity: [0.25, 0.95, 0.25],
              scaleX: [1, 1.45, 1],
            }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
