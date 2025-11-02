type Dream = {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    sourceType: string;
    visibility: string;
    rawText: string;                
    summary: string;                 
    sentiment: float;
    valence: float;
    arousal: float;
    intensity: float;
    emotion: string;
    safetyFlag: boolean;
    mediaItems: any[];
    tags: any[];
}

type DreamMediaOverlay = {
    sourceUrl: string;
    kind: string;
    description: string | null;
    effect: string;
    blendMode: "screen" | "lighten" | "overlay" | "color-dodge" | "soft-light" | "difference" | "hard-light";
    opacity: number;
    scale: number;
    rotation: number;
    position: {
      x: number;
      y: number;
    };
    filter: string;
  }
  
