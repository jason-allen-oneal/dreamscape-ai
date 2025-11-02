import { PrismaClient, TagType, EmotionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // currentTime minus 10 minutes
  const currentTime = Math.floor(Date.now() / 1000);
  const timeOffset = currentTime - 1800;

  await prisma.config.upsert({
    where: { key: "lastGenerated" },
    update: { value: timeOffset.toString() },
    create: { key: "lastGenerated", value: timeOffset.toString() },
  });

  await prisma.config.upsert({
    where: { key: "lastDescription" },
    update: { value: "" },
    create: { key: "lastDescription", value: "" },
  });

  // Create or reuse test user
  const user = await prisma.user.upsert({
    where: { username: "Jason" },
    update: {},
    create: {
      username: "Jason",
      password: bcrypt.hashSync(process.env.ADMIN_PASS!, 10),
      consentWorld: true,
    },
  });

  console.log(`✅ User created: ${user.username}`);

  // ---------- Seed TagDictionary ----------
  const tagSeeds = [
    { type: TagType.ARCHETYPE, value: "shadow" },
    { type: TagType.ARCHETYPE, value: "anima" },
    { type: TagType.ARCHETYPE, value: "noble" },
    { type: TagType.ENTITY, value: "dog" },
    { type: TagType.ENTITY, value: "rabbits" },
    { type: TagType.ENTITY, value: "lettuce" },
    { type: TagType.ENTITY, value: "food" },
    { type: TagType.ENTITY, value: "key" },
    { type: TagType.ENTITY, value: "laurel" },
    { type: TagType.ENTITY, value: "crest" },
    { type: TagType.PLACE, value: "hole" },
    { type: TagType.ACTION, value: "gave" },
    { type: TagType.ACTION, value: "feeding" },
    { type: TagType.ACTION, value: "mocking" },
    { type: TagType.EMOTION, value: "love" },
    { type: TagType.EMOTION, value: "calm" },
    { type: TagType.EMOTION, value: "compassion" },
    { type: TagType.EMOTION, value: "anxiety" },
  ];

  await prisma.tagDictionary.createMany({ data: tagSeeds, skipDuplicates: true });
  console.log(`🌙 Seeded ${tagSeeds.length} tag dictionary entries`);

  // ---------- Seed Dreams ----------
  await prisma.dream.createMany({
    data: [
      {
        id: "dream1",
        userId: user.id,
        sourceType: "TEXT",
        visibility: "WORLD",
        rawText: "there was a dog in a hole. i gave it some food.",
        summary: "The dreamer encountered a dog in a hole and offered it food.",
        sentiment: 0.7,
        valence: 0.8,
        arousal: 0.3,
        intensity: 0.4,
        emotion: EmotionType.LOVE,
      },
      {
        id: "dream2",
        userId: user.id,
        sourceType: "TEXT",
        visibility: "WORLD",
        rawText: "there were a couple of rabbits in a hole. i gave them lettuce.",
        summary: "The dreamer observed rabbits in a hole and offered them lettuce.",
        sentiment: 0.7,
        valence: 0.8,
        arousal: 0.2,
        intensity: 0.3,
        emotion: EmotionType.CALM,
      },
      {
        id: "dream3",
        userId: user.id,
        sourceType: "TEXT",
        visibility: "WORLD",
        rawText:
          "i had a dream in which i was a noble. my crest was a key surrounded by laurel. the crest was everywhere i looked, laughing, mocking.",
        summary:
          "The dreamer perceived themselves as a noble whose personal crest, a key surrounded by laurel, appeared ubiquitously and mockingly.",
        sentiment: -0.6,
        valence: 0.2,
        arousal: 0.6,
        intensity: 0.6,
        emotion: EmotionType.ANXIETY,
      },
    ],
    skipDuplicates: true,
  });

  console.log("💭 Seeded dreams for Jason");

  // ---------- Seed Media ----------
  await prisma.media.createMany({
    data: [
      {
        id: "media1",
        dreamId: "dream3",
        kind: "IMAGE",
        url: "/uploads/1761959692521-veyrian_prime.png",
        mime: "image/png",
      },
    ],
    skipDuplicates: true,
  });

  console.log("🖼️ Seeded dream media");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
