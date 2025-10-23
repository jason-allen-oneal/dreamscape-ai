type EmotionKey =
  | "JOY"
  | "FEAR"
  | "SADNESS"
  | "ANGER"
  | "LOVE"
  | "CURIOSITY"
  | "DEFAULT"
  | string;

interface EmotionTheme {
  gradient: string;
  glow: string;
  aura: string;
  text: string;
}

const EMOTION_THEMES: Record<EmotionKey, EmotionTheme> = {
  JOY: {
    gradient: "from-amber-300 via-orange-400 to-rose-500",
    glow: "shadow-[0_0_32px_rgba(251,191,36,0.45)]",
    aura: "rgba(252, 211, 77, 0.4)",
    text: "text-amber-200",
  },
  FEAR: {
    gradient: "from-indigo-400 via-violet-500 to-purple-700",
    glow: "shadow-[0_0_32px_rgba(99,102,241,0.45)]",
    aura: "rgba(129, 140, 248, 0.35)",
    text: "text-indigo-200",
  },
  SADNESS: {
    gradient: "from-sky-400 via-cyan-500 to-teal-600",
    glow: "shadow-[0_0_32px_rgba(59,130,246,0.4)]",
    aura: "rgba(14, 165, 233, 0.35)",
    text: "text-sky-200",
  },
  ANGER: {
    gradient: "from-rose-500 via-red-500 to-orange-500",
    glow: "shadow-[0_0_32px_rgba(248,113,113,0.45)]",
    aura: "rgba(248, 113, 113, 0.35)",
    text: "text-rose-200",
  },
  LOVE: {
    gradient: "from-pink-400 via-rose-500 to-fuchsia-500",
    glow: "shadow-[0_0_32px_rgba(244,114,182,0.5)]",
    aura: "rgba(236, 72, 153, 0.4)",
    text: "text-pink-200",
  },
  CURIOSITY: {
    gradient: "from-emerald-400 via-green-500 to-lime-500",
    glow: "shadow-[0_0_32px_rgba(52,211,153,0.45)]",
    aura: "rgba(16, 185, 129, 0.35)",
    text: "text-emerald-200",
  },
  DEFAULT: {
    gradient: "from-fuchsia-400 via-purple-500 to-indigo-600",
    glow: "shadow-[0_0_32px_rgba(168,85,247,0.45)]",
    aura: "rgba(192, 132, 252, 0.35)",
    text: "text-fuchsia-200",
  },
};

export function getEmotionTheme(emotion?: string): EmotionTheme {
  if (!emotion) {
    return EMOTION_THEMES.DEFAULT;
  }

  return EMOTION_THEMES[emotion] ?? EMOTION_THEMES.DEFAULT;
}
