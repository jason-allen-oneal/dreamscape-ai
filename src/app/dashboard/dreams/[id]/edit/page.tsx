import prisma from "@/lib/prisma";
import DreamEditForm from "@/components/dream/DreamEditForm";
import { SpectralBackdrop } from "@/components/layout/SpectralBackdrop";

interface DreamProps {
  params: { id: string };
}

export default async function DreamEditPage({ params }: DreamProps) {
  const dream = await prisma.dream.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      rawText: true,
      summary: true,
      emotion: true,
      visibility: true,
    },
  });

  if (!dream) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden text-white">
        <SpectralBackdrop className="opacity-70" />
        <p className="relative z-10 rounded-2xl border border-white/15 bg-white/10 px-6 py-4 backdrop-blur">
          Dream not found.
        </p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden px-6 py-16 text-white">
      <SpectralBackdrop className="opacity-80" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-10">
        <header className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">
            Edit Dream
          </p>
          <h1 className="text-4xl font-semibold text-white/90 md:text-5xl">
            Reweave Your Reverie
          </h1>
          <p className="text-sm leading-relaxed text-white/65 md:text-base">
            Refine the narrative, update its resonance, and decide how it drifts
            through the collective.
          </p>
        </header>

        <DreamEditForm dream={dream} />
      </div>
    </main>
  );
}
