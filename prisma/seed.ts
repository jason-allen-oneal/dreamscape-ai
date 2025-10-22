import { PrismaClient, TagType } from "@prisma/client";
const prisma = new PrismaClient();

import bcrypt from "bcryptjs";

async function main() {
  const user = await prisma.user.upsert({
    where: { username: "Jason" },
    update: {},
    create: {
      username: "Jason",
      password: bcrypt.hashSync(process.env.ADMIN_PASS!, 10),
      consentWorld: true,
    },
  });
  console.log(`✅ Test user created: ${user.username}`);

  // TagDictionary seed set
  const tagSeeds = [
    // Archetypes
    { type: TagType.ARCHETYPE, value: "shadow" },
    { type: TagType.ARCHETYPE, value: "anima" },
    { type: TagType.ARCHETYPE, value: "trickster" },
    { type: TagType.ARCHETYPE, value: "guardian" },
    { type: TagType.ARCHETYPE, value: "labyrinth" },
    { type: TagType.ARCHETYPE, value: "ocean" },
    { type: TagType.ARCHETYPE, value: "forest" },
    { type: TagType.ARCHETYPE, value: "tower" },
    { type: TagType.ARCHETYPE, value: "threshold" },
    { type: TagType.ARCHETYPE, value: "rebirth" },

    // Actions
    { type: TagType.ACTION, value: "falling" },
    { type: TagType.ACTION, value: "flying" },
    { type: TagType.ACTION, value: "running" },
    { type: TagType.ACTION, value: "hiding" },
    { type: TagType.ACTION, value: "chasing" },
    { type: TagType.ACTION, value: "floating" },
    { type: TagType.ACTION, value: "transforming" },
    { type: TagType.ACTION, value: "speaking_with_the_dead" },

    // Emotions
    { type: TagType.EMOTION, value: "awe" },
    { type: TagType.EMOTION, value: "dread" },
    { type: TagType.EMOTION, value: "grief" },
    { type: TagType.EMOTION, value: "nostalgia" },
    { type: TagType.EMOTION, value: "joy" },
    { type: TagType.EMOTION, value: "serenity" },
    { type: TagType.EMOTION, value: "panic" },
    { type: TagType.EMOTION, value: "curiosity" },
    { type: TagType.EMOTION, value: "desire" },

    // Colors
    { type: TagType.COLOR, value: "blue-green" },
    { type: TagType.COLOR, value: "crimson" },
    { type: TagType.COLOR, value: "gold" },
    { type: TagType.COLOR, value: "violet" },
    { type: TagType.COLOR, value: "gray" },
    { type: TagType.COLOR, value: "amber" },
    { type: TagType.COLOR, value: "black" },
    { type: TagType.COLOR, value: "white" },
  ];

  await prisma.tagDictionary.createMany({
    data: tagSeeds,
    skipDuplicates: true,
  });

  console.log(`🌙 Seeded ${tagSeeds.length} tag dictionary entries`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
