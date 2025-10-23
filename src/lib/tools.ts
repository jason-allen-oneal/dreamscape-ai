import { Prisma, TagType } from "@prisma/client";
import prisma from "./prisma";

export interface CreateTagArgs {
  type: TagType;
  value: string;
  weight?: number;
  dreamId: string;
}

export interface DatabaseTool {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
  function: (args: CreateTagArgs) => Promise<{
    tagDict: Prisma.TagDictionary;
    dreamTag: Prisma.DreamTag;
  }>;
}

const defaultWeight = (weight?: number): number =>
  typeof weight === "number" ? weight : 1;

const dbTools: DatabaseTool[] = [
  {
    name: "createTag",
    description: "Create or fetch a tag in the database and link it to a dream",
    parameters: {
      type: "object",
      properties: {
        type: { type: "string" },
        value: { type: "string" },
        weight: { type: "number" },
        dreamId: { type: "string" },
      },
      required: ["type", "value", "dreamId"],
    },
    function: async ({ type, value, weight, dreamId }: CreateTagArgs) => {
      const tagDict = await prisma.tagDictionary.upsert({
        where: { value },
        update: {},
        create: { type, value },
      });

      const dreamTag = await prisma.dreamTag.create({
        data: {
          dreamId,
          tagDictionaryId: tagDict.id,
          weight: defaultWeight(weight),
        },
      });

      return { tagDict, dreamTag };
    },
  },
];

export default dbTools;
