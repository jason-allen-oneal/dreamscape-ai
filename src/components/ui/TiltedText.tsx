import { useMemo } from "react";
import { motion } from "framer-motion";

/** Tilted word-by-word “Chromatica” style */
export default function TiltedText({ text }: { text: string }) {
    const paragraphs = useMemo(() => text.split(/\n{2,}/g).map(p => p.split(/\n/g)), [text]);
    const tiltClasses = ["tilt-l", "tilt-r", "tilt-l2x", "tilt-r2x"];
    let wordIndex = 0;
  
    return (
      <div className="desc-tilt-root">
        {paragraphs.map((lines, pi) => (
          <div key={`p-${pi}`} className="mb-4 last:mb-0">
            {lines.map((line, li) => {
              const words = line.trim().split(/\s+/).filter(Boolean);
              return (
                <div key={`p-${pi}-l-${li}`} className="desc-tilt-line">
                  {words.map((word) => {
                    const idx = wordIndex++;
                    const tilt = tiltClasses[idx % tiltClasses.length];
                    return (
                      <motion.span
                        key={`w-${idx}`}
                        className={`desc-word ${tilt}`}
                        initial={{ opacity: 0, y: 10 }}   // don't animate rotate; preserves tilt
                        animate={{ opacity: 0.97, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.02 * (idx % 20) }}
                        style={{ rotate: "var(--tilt, 0deg)" }}
                        whileHover={{ y: -1, scale: 1.04 }}
                      >
                        {word}
                      </motion.span>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
