"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DreamWorld from "@/components/world/WorldScene";
import { SpectralBackdrop } from "@/components/layout/SpectralBackdrop";
import SurrealLoader from "@/components/layout/SurrealLoader";

const DEFAULT_ASSETS = {
  background: "/generated/background.png",
  floater1: "/generated/floating1.png",
  floater2: "/generated/floating2.png",
  video: "/generated/video.mp4",
} as const;

interface AssetSnapshot {
  background?: string;
  floating1?: string;
  floating2?: string;
  video?: string;
  music?: string;
}

const normalizeMediaPath = (asset?: string | null): string => {
  if (!asset) return "";

  const sanitized = asset.replace(/\\/g, "/");
  if (sanitized.startsWith("http://") || sanitized.startsWith("https://") || sanitized.startsWith("data:")) {
    return sanitized;
  }

  const publicSegment = "/public/";
  const publicIndex = sanitized.indexOf(publicSegment);
  if (publicIndex !== -1) {
    const relative = sanitized.slice(publicIndex + publicSegment.length);
    return `/${relative.replace(/^\/+/, "")}`;
  }

  if (sanitized.startsWith("public/")) {
    return `/${sanitized.slice("public/".length).replace(/^\/+/, "")}`;
  }

  return sanitized.startsWith("/") ? sanitized : `/${sanitized.replace(/^\/+/, "")}`;
};

export default function WorldPage() {
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [floater1, setFloater1] = useState<string>("");
  const [floater2, setFloater2] = useState<string>("");
  const [video, setVideo] = useState<string>("");
  const [music, setMusic] = useState<string>("");
  const [navHeight, setNavHeight] = useState(0);

  useEffect(() => {
    let isActive = true;

    const ensureAssetsAvailable = async (paths: string[]) => {
      const candidates = paths
        .map((assetPath) => normalizeMediaPath(assetPath))
        .filter((resolvedPath): resolvedPath is string => Boolean(resolvedPath));

      if (!candidates.length) {
        return false;
      }

      const results = await Promise.all(
        candidates.map(async (resolvedPath) => {
          try {
            const response = await fetch(resolvedPath, {
              method: "HEAD",
              cache: "no-store",
            });
            return response.ok;
          } catch {
            return false;
          }
        })
      );

      return results.length > 0 && results.every(Boolean);
    };

    const extractLegacyVideo = (snapshot?: AssetSnapshot | null): string | undefined => {
      if (!snapshot) return undefined;
      if (snapshot.video) return snapshot.video;
      const legacy = (snapshot as { videos?: unknown }).videos;
      if (Array.isArray(legacy)) {
        return legacy.find((item): item is string => typeof item === "string" && item.length > 0);
      }
      return undefined;
    };

    const hydrateFromSnapshot = (fallbackDescription: string, snapshot?: AssetSnapshot | null) => {
      const snapshotVideo = extractLegacyVideo(snapshot);

      const backgroundPath = normalizeMediaPath(snapshot?.background ?? DEFAULT_ASSETS.background);
      const floaterOnePath = normalizeMediaPath(snapshot?.floating1 ?? DEFAULT_ASSETS.floater1);
      const floaterTwoPath = normalizeMediaPath(snapshot?.floating2 ?? DEFAULT_ASSETS.floater2);
      const primaryVideo = normalizeMediaPath(snapshotVideo ?? DEFAULT_ASSETS.video);

      const snapshotMusic = snapshot?.music ?? "";

      setDescription(fallbackDescription ?? "");
      setBackgroundImage(backgroundPath);
      setFloater1(floaterOnePath);
      setFloater2(floaterTwoPath);
      setVideo(primaryVideo);
      setMusic(normalizeMediaPath(snapshotMusic));
    };

    const fetchWorld = async () => {
      const response = await fetch("/api/world", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`World generation failed with status ${response.status}`);
      }
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }

      if (!isActive) return;

      setBackgroundImage(normalizeMediaPath(data?.images?.[0]));
      setFloater1(normalizeMediaPath(data?.images?.[1]));
      setFloater2(normalizeMediaPath(data?.images?.[2]));
      const apiVideo = typeof data?.video === "string" ? data.video : undefined;
      const legacyVideo = Array.isArray((data as { videos?: string[] })?.videos)
        ? (data as { videos?: string[] }).videos?.find(
            (item): item is string => typeof item === "string" && item.length > 0,
          )
        : undefined;
      const resolvedVideo = apiVideo ?? legacyVideo ?? DEFAULT_ASSETS.video;
      setVideo(normalizeMediaPath(resolvedVideo));
      setDescription(data?.description ?? "");
      setMusic(normalizeMediaPath(data?.music));
    };

    const prepareWorld = async () => {
      try {
        const statusResponse = await fetch("/api/world/status", { cache: "no-store" });
        if (!statusResponse.ok) {
          throw new Error(`Status request failed with status ${statusResponse.status}`);
        }

        const statusData = await statusResponse.json();
        if (!isActive) {
          return;
        }

        const rawLastGenerated = statusData?.lastGenerated ?? "";
        const assetSnapshot: AssetSnapshot | null =
          statusData?.lastAssets && typeof statusData.lastAssets === "object"
            ? statusData.lastAssets
            : null;

        const parsedLastGenerated = Number(rawLastGenerated);
        const hasRecentGeneration =
          Number.isFinite(parsedLastGenerated) &&
          Date.now() / 1000 - parsedLastGenerated < 1800;

        const snapshotVideo = extractLegacyVideo(assetSnapshot);

        const assetsReady = await ensureAssetsAvailable([
          assetSnapshot?.background ?? DEFAULT_ASSETS.background,
          assetSnapshot?.floating1 ?? DEFAULT_ASSETS.floater1,
          assetSnapshot?.floating2 ?? DEFAULT_ASSETS.floater2,
          snapshotVideo ?? DEFAULT_ASSETS.video,
        ]);
        if (!isActive) return;

        if (!hasRecentGeneration || !assetsReady) {
          await fetchWorld();
        } else {
          hydrateFromSnapshot(statusData?.lastDescription ?? "", assetSnapshot);
        }
      } catch (error) {
        console.error("Failed to prepare dream world:", error);
        try {
          await fetchWorld();
        } catch (generationError) {
          console.error("Failed to generate dream world assets:", generationError);
          if (isActive) {
            setDescription("");
            setBackgroundImage("");
            setFloater1("");
            setFloater2("");
            setVideo("");
            setMusic("");
          }
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    prepareWorld();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const navElement = document.querySelector<HTMLElement>("nav[data-site-navbar]");
    if (!navElement) return;

    const updateNavMetrics = () => {
      const { height } = navElement.getBoundingClientRect();
      setNavHeight((prev) => (Math.abs(prev - height) < 0.5 ? prev : height));
    };

    updateNavMetrics();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => updateNavMetrics())
        : null;

    resizeObserver?.observe(navElement);
    window.addEventListener("resize", updateNavMetrics);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateNavMetrics);
    };
  }, []);

  useEffect(() => {
    const { style: bodyStyle } = document.body;
    const { style: rootStyle } = document.documentElement;
    const previousBodyOverflow = bodyStyle.overflowY;
    const previousRootOverflow = rootStyle.overflowY;

    bodyStyle.overflowY = "hidden";
    rootStyle.overflowY = "hidden";

    return () => {
      bodyStyle.overflowY = previousBodyOverflow;
      rootStyle.overflowY = previousRootOverflow;
    };
  }, []);

  const viewportHeight = navHeight ? `calc(100dvh - ${navHeight}px)` : "100dvh";

  return (
    <main className="relative w-full overflow-hidden text-white" style={{ height: viewportHeight }}>
      <SpectralBackdrop className="opacity-40" />
      {loading && (
        <SurrealLoader />
      )}

      {!loading && (
        <motion.div
          className="h-full w-full"
          style={{ height: "100%" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <DreamWorld description={description} background={backgroundImage} images={[floater1, floater2]} video={video} music={music} />
        </motion.div>
      )}
    </main>
  );
}
