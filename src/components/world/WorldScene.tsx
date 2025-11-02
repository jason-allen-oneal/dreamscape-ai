"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import TiltedDescription from "./TiltedDescription";

interface Props {
  description: string;
  background: string;
  images: string[];
  video: string;
  music: string;
}

const FALLBACK_IMAGE_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAADwCAYAAABu6H0fAAAABHNCSVQICAgIfAhkiAAAA3hJREFUeJzt3VEOwjAQBVDX6dBk4hAmx0mQezbLcA6IKM6yBVHis7FmAAAAAADgX9wuYv/B3bVitVo1v7/f74Pak5dvrs7MfAj5Fufv/N7XdkjXbXvOHPx4AQAEABAAQAEABACQMU1zGq1+n97d33bvLRfxyjq/fWc3AIAAAAgAACAAgAIAAAAgAACAAgAIAAAAgAACAAgAIAAQAEABAAQAEABAAQAEABAAQAEABACQxT2yJ3D3zXBd13k1Go/X63Ud8i9bVX2f+fZF3IN7H9d1fdd1nQ/f3drDh9VqtVqt1ut1uu64HgAAABAAQAEABAAQAEABAAQAEABAAQAEAJAxTX8f7u7e/V6vVqtVqu1Wq/X6/W6zrnfd90Xdu/fu7sAAAAAAAAAAAAAAIBf7AUcQjo15EBqAAAAAElFTkSuQmCC";

const EDGE_GRAIN_FILTER_ID = "edge-grain";
const EDGE_GRAIN_BLUR_RADIUS = 6;
const EDGE_GRAIN_DISPLACEMENT_SCALE = 14;

const EFFECT_GLOW_CLASS: Record<string, string> = {
  veo_glasswave:
    "after:absolute after:inset-0 after:bg-gradient-to-br after:from-indigo-400/20 after:to-purple-400/10 after:blur-3xl after:content-[''] after:rounded-full",
  veo_smokeveil:
    "after:absolute after:inset-[-20%] after:bg-indigo-300/10 after:blur-[140px] after:content-['']",
  veo_liquid:
    "after:absolute after:inset-[-25%] after:bg-gradient-to-r after:from-rose-500/20 after:via-amber-400/15 after:to-sky-500/15 after:content-[''] after:blur-3xl",
  nano_prism:
    "after:absolute after:inset-[-15%] after:bg-gradient-to-br after:from-sky-400/20 after:via-fuchsia-400/10 after:to-lime-400/10 after:content-[''] after:blur-[90px]",
  nano_phosphor:
    "after:absolute after:inset-[-18%] after:bg-sky-300/25 after:content-[''] after:blur-[110px]",
  nano_echo:
    "after:absolute after:inset-[-22%] after:border after:border-indigo-300/25 after:rounded-full after:content-[''] after:blur-[120px]",
};

interface OverlayConfig {
  id: string;
  src: string;
  left: string;
  top: string;
  zIndex: number;
  opacity: number;
  sizePx: number;
  effectClass: string;
  depthBlurPx: number;

  floatX: number;
  floatY: number;
  floatDuration: number;
  floatDelay: number;
  rollAmp: number;

  panAmpX: number;
  panAmpY: number;
  panDuration: number;
  panDelay: number;

  tiltAmpX: number;
  tiltAmpY: number;
  zoomAmp: number;
  tzDuration: number;
  tzDelay: number;
  jitterAmp: number;
}

type CSSVarStyles = CSSProperties & Record<`--${string}`, string | number>;

const normalizeUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return url;
  return `/${url.replace(/^\/+/, "")}`;
};

export default function WorldScene({
  description,
  background,
  images,
  video,
  music,
}: Props) {
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const baseImage = background || FALLBACK_IMAGE_DATA_URI;
  const [showDescription, setShowDescription] = useState(false);
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(false);

  const overlayConfigs = useMemo<OverlayConfig[]>(() => {
    if (!images?.length) return [];

    const keys = Object.keys(EFFECT_GLOW_CLASS);
    const r = (min: number, max: number) => Math.random() * (max - min) + min;
    const ri = (min: number, max: number) => Math.floor(r(min, max + 1));

    const placements: Array<{ x: number; y: number; radius: number }> = [];
    const toRadiusPercent = (sizePx: number) => Math.min(sizePx / 28, 18);

    const configs: OverlayConfig[] = [];

    images.filter(Boolean).forEach((imgSrc, index) => {
      const sizePx = r(240, 360);
      const depthBlurPx = 0;
      const fxKey = keys[ri(0, keys.length - 1)];

      let floatX = r(-28, 28);
      let floatY = r(-24, 24);
      let floatDuration = r(16, 26);
      let floatDelay = r(0, 4);
      let rollAmp = r(10, 22);

      let panAmpX = r(80, 180);
      let panAmpY = r(50, 140);
      let panDuration = r(28, 50);
      let panDelay = r(0, 10);

      const tiltAmpX = r(8, 16);
      const tiltAmpY = r(8, 16);
      const zoomAmp = r(0.1, 0.22);
      const tzDuration = r(6.5, 11);
      const tzDelay = r(0, 4);
      let jitterAmp = r(3, 10);

      const radius =
        toRadiusPercent(sizePx) +
        Math.max(Math.abs(floatX), Math.abs(floatY)) / 12 +
        Math.max(panAmpX, panAmpY) / 14 +
        6;

      let leftPercent = 50;
      let topPercent = 50;
      let placed = false;

      for (let attempt = 0; attempt < 40; attempt += 1) {
        const candidateLeft = r(18, 82);
        const candidateTop = r(20, 80);

        const overlaps = placements.some((pos) => {
          const dx = pos.x - candidateLeft;
          const dy = pos.y - candidateTop;
          const minDistance = pos.radius + radius;
          return dx * dx + dy * dy < minDistance * minDistance;
        });

        if (!overlaps) {
          leftPercent = candidateLeft;
          topPercent = candidateTop;
          placements.push({ x: candidateLeft, y: candidateTop, radius });
          placed = true;
          break;
        }
      }

      if (!placed) {
        floatX = floatY = 0;
        panAmpX = panAmpY = 40;
        panDuration = 40;
        panDelay = index;
        floatDuration = 22;
        floatDelay = index * 0.4;
        rollAmp = 8;
        jitterAmp = 3;
        const fallbackLeft = index % 2 === 0 ? 34 : 66;
        const fallbackTop = 50 + (index % 2 === 0 ? -8 : 8);
        leftPercent = fallbackLeft;
        topPercent = fallbackTop;
        placements.push({ x: leftPercent, y: fallbackTop, radius: 14 });
      }

      configs.push({
        id: `${index}-${Math.random().toString(36).slice(2, 8)}`,
        src: normalizeUrl(String(imgSrc)),
        left: `${leftPercent.toFixed(2)}%`,
        top: `${topPercent.toFixed(2)}%`,
        zIndex: 10 + ri(0, 5),
        opacity: r(0.62, 0.92),
        sizePx,
        effectClass: EFFECT_GLOW_CLASS[fxKey],
        depthBlurPx,
        floatX,
        floatY,
        floatDuration,
        floatDelay,
        rollAmp,
        panAmpX,
        panAmpY,
        panDuration,
        panDelay,
        tiltAmpX,
        tiltAmpY,
        zoomAmp,
        tzDuration,
        tzDelay,
        jitterAmp,
      });
    });

    return configs;
  }, [images]);

  const videoSource = normalizeUrl(video);

  useEffect(() => {
    if (!videoSource) {
      const timeout = setTimeout(() => setShowDescription(true), 600);
      return () => clearTimeout(timeout);
    }
    setShowDescription(false);
  }, [videoSource]);

  return (
    <>
      <section className="relative flex h-full w-full overflow-hidden bg-black text-white">
        <EdgeGrainFilterDefs />

        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={baseImage}
            alt="Dreamscape backdrop"
            className={`h-full w-full object-cover object-center transition-opacity duration-1000 ${isBackgroundLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setIsBackgroundLoaded(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.4),_rgba(2,4,9,0.92))]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/70" />
        </div>

        {/* Video overlay */}
        <VideoOverlay
          src={videoSource}
          onPlayStart={() => setShowDescription(false)}
          onFadeComplete={() => setShowDescription(true)}
        />

        {/* Floaters */}
        <div className="absolute inset-0 z-20">
          {overlayConfigs.map((cfg) => (
            <MediaOverlay key={cfg.id} config={cfg} />
          ))}
        </div>

        <TiltedDescription
          description={description}
          showDescription={showDescription}
          isCollapsed={isDescriptionCollapsed}
          onToggle={() => setIsDescriptionCollapsed((prev) => !prev)}
        />
      </section>
    </>
  );
}



function MediaOverlay({ config }: { config: OverlayConfig }) {
  const [source, setSource] = useState(config.src || FALLBACK_IMAGE_DATA_URI);

  const wrapperStyle: CSSProperties = {
    left: config.left,
    top: config.top,
    transform: "translate(-50%, -50%)",
    zIndex: config.zIndex,
    perspective: 1100,
  };

  const panVars: CSSVarStyles = {
    "--pan-x": `${config.panAmpX}px`,
    "--pan-y": `${config.panAmpY}px`,
    "--pan-duration": `${config.panDuration}s`,
    "--pan-delay": `${config.panDelay}s`,
  };

  const floatVars: CSSVarStyles = {
    "--float-x": `${config.floatX}px`,
    "--float-y": `${config.floatY}px`,
    "--roll-amp": config.rollAmp,
    "--base-scale": (config.sizePx / 256).toFixed(3),
    "--zoom-amp": config.zoomAmp,
    "--float-duration": `${config.floatDuration}s`,
    "--float-delay": `${config.floatDelay}s`,
  };

  const tiltVars: CSSVarStyles = {
    "--tilt-x": config.tiltAmpX,
    "--tilt-y": config.tiltAmpY,
    "--jitter-amp": `${config.jitterAmp}px`,
    "--zoom-amp": config.zoomAmp,
    "--tz-duration": `${config.tzDuration}s`,
    "--tz-delay": `${config.tzDelay}s`,
  };

  return (
    <div className="absolute" style={wrapperStyle}>
      <div className="anim-pan" style={panVars}>
        <div className="relative anim-float" style={{ ...floatVars, transformStyle: "preserve-3d" }}>
          <div
            className={`relative overflow-hidden anim-tilt ${config.effectClass}`}
            style={{
              ...tiltVars,
              width: `${config.sizePx}px`,
              height: `${config.sizePx}px`,
              opacity: config.opacity,
              filter: `url(#${EDGE_GRAIN_FILTER_ID})`,
            }}
          >
            <img
              src={source}
              alt="Dream floater"
              className="grainy-edge h-full w-full object-cover object-center select-none"
              loading="lazy"
              draggable={false}
              onError={() => setSource(FALLBACK_IMAGE_DATA_URI)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoOverlay({
  src,
  onFadeComplete,
  onPlayStart,
}: {
  src: string;
  onFadeComplete?: () => void;
  onPlayStart?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevHasError = useRef(false);

  const clearFadeTimeout = () => {
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (videoRef.current && src) {
      setHasError(false);
      setIsFading(false);
      clearFadeTimeout();
      videoRef.current.load();
      const p = videoRef.current.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
    prevHasError.current = false;
    return () => clearFadeTimeout();
  }, [src]);

  useEffect(() => {
    if (hasError && !prevHasError.current) {
      onFadeComplete?.();
    }
    prevHasError.current = hasError;
  }, [hasError, onFadeComplete]);

  const handlePlay = () => {
    setHasError(false);
    setIsFading(false);
    clearFadeTimeout();
    onPlayStart?.();
  };

  const handleEnded = () => {
    setIsFading(true);
    clearFadeTimeout();
    fadeTimeoutRef.current = setTimeout(() => {
      onFadeComplete?.();
    }, 2000);
  };

  if (!src || hasError) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-10 overflow-hidden transition-opacity duration-[2000ms] ease-out ${isFading ? "opacity-0" : "opacity-100"}`}
    >
      <video
        key={src}
        ref={videoRef}
        className="h-full w-full object-cover opacity-60 mix-blend-screen brightness-110 contrast-105 saturate-125"
        autoPlay
        muted
        playsInline
        preload="auto"
        disableRemotePlayback
        onPlay={handlePlay}
        onEnded={handleEnded}
        onError={() => setHasError(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/5 to-black/25" />
    </div>
  );
}

function EdgeGrainFilterDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
    >
      <filter
        id={EDGE_GRAIN_FILTER_ID}
        x="-.5"
        y="-.5"
        width="2"
        height="2"
        colorInterpolationFilters="sRGB"
      >
        <feMorphology radius={EDGE_GRAIN_BLUR_RADIUS * 3} />
        <feGaussianBlur stdDeviation={EDGE_GRAIN_BLUR_RADIUS} result="blur" />
        <feTurbulence type="fractalNoise" baseFrequency=".713" numOctaves="4" />
        <feDisplacementMap in="blur" scale={EDGE_GRAIN_DISPLACEMENT_SCALE} xChannelSelector="R" />
        <feComposite in="SourceGraphic" operator="in" />
      </filter>
    </svg>
  );
}
