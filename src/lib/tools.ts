import { TagType, TagDictionary, DreamTag } from "@prisma/client";
import prisma from "./prisma";
import type { Schema } from "@google/genai";
import { Type } from "@google/genai";

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
    type: Type.OBJECT;
    properties: Record<string, Schema>;
    required: string[];
  };
  function: (args: unknown) => Promise<{
    tagDict: TagDictionary;
    dreamTag: DreamTag;
  }>;
}

const defaultWeight = (weight?: number): number =>
  typeof weight === "number" ? weight : 1;

const dbTools: DatabaseTool[] = [
  {
    name: "createTag",
    description: "Create or fetch a tag in the database and link it to a dream",
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING },
        value: { type: Type.STRING },
        weight: { type: Type.NUMBER },
        dreamId: { type: Type.STRING },
      },
      required: ["type", "value", "dreamId"],
    },
    function: async (args: unknown) => {
      // Validate and type-check the arguments
      if (
        !args ||
        typeof args !== "object" ||
        !("type" in args) ||
        !("value" in args) ||
        !("dreamId" in args)
      ) {
        throw new Error("Invalid arguments for createTag");
      }
      
      const { type, value, weight, dreamId } = args as CreateTagArgs;
      
      if (typeof type !== "string" || typeof value !== "string" || typeof dreamId !== "string") {
        throw new Error("Invalid argument types for createTag");
      }

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
