import prisma from "./prisma";

const dbTools = [
    {
      name: "createTag",
      description: "Create or fetch a tag in the database and link it to a dream",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string" },
          value: { type: "string" },
          weight: { type: "number" },
          dreamId: { type: "string" }
        },
        required: ["type", "value", "dreamId"]
      },
      function: async ({ type, value, weight, dreamId }: any) => {
        // First, create or get the tag dictionary entry
        const tagDict = await prisma.tagDictionary.upsert({
          where: { value },
          update: {},
          create: { type, value },
        });
        
        // Then create the dream-tag relationship
        const dreamTag = await prisma.dreamTag.create({
          data: {
            dreamId,
            tagDictionaryId: tagDict.id,
            weight: weight || 1.0,
          },
        });
        
        return { tagDict, dreamTag };
      },
    },
  ];

export default dbTools;