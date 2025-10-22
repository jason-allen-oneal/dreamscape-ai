
// src/app/dreams/page.tsx

import prisma from "@/lib/prisma";
import DreamsPageClient from "@/components/dream/DreamsPageClient";

export default async function DreamsPage() {
  const dreams = await prisma.dream.findMany({
    where: { visibility: "WORLD" },
    include: { 
      mediaItems: true,
      tags: {
        include: {
          tagDictionary: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return <DreamsPageClient dreams={dreams} />;
}
