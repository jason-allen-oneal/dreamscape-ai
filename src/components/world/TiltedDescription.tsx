
import { AnimatePresence, motion } from "framer-motion";
import TiltedText from "@/components/ui/TiltedText";
import { JSX } from "react";

interface TiltedDescriptionProps {
  description: string;
  showDescription: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function TiltedDescription({
  description,
  showDescription,
  isCollapsed,
  onToggle,
}: TiltedDescriptionProps): JSX.Element {
  const descriptionId = "world-description-content";

  return (
    <>
      <AnimatePresence>
        {showDescription && description && !isCollapsed && (
          <motion.div
            key="world-description-expanded"
            className="pointer-events-auto absolute inset-0 z-30 flex items-end justify-center pb-14 px-6"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
          >
            <div className="w-full max-w-6xl rounded-[32px] border border-white/5 bg-white/[0.01] p-[1px] backdrop-blur-sm">
              <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-white/[0.08]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.2),_transparent_92%)] opacity-30" />
                <div id={descriptionId} className="relative px-6 py-8 md:px-10 md:py-10">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <p className="text-xs uppercase tracking-[0.45em] text-white/60">
                      Dream Narrative
                    </p>
                    <button
                      type="button"
                      onClick={onToggle}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.32em] text-white/70 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-0"
                      aria-label="Collapse dream narrative"
                      aria-expanded={true}
                      aria-controls={descriptionId}
                    >
                      Hide
                    </button>
                  </div>
                  <TiltedText text={description} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDescription && description && isCollapsed && (
          <motion.button
            key="world-description-collapsed"
            type="button"
            onClick={onToggle}
            className="pointer-events-auto absolute bottom-14 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white/80 backdrop-blur transition hover:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-white/60"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            aria-label="Expand dream narrative"
            aria-expanded={false}
            aria-controls={descriptionId}
          >
            Show Narrative
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
