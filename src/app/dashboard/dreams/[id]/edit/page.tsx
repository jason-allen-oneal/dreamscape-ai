import prisma from "@/lib/prisma";
import DreamEditForm from "@/components/dream/DreamEditForm";

// ─── TYPES ─────────────────────────────────────────────
interface DreamProps {
  params: { id: string };
}

// ─── SERVER COMPONENT ──────────────────────────────────
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
      <main className="min-h-screen flex items-center justify-center text-white">
        <p>Dream not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-6">Edit Dream</h1>
      <DreamEditForm dream={dream} />
    </main>
  );
}
