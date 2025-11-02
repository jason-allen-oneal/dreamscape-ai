import { GoogleGenAI, type Schema, Type } from "@google/genai";

// Agent configuration interface for agentic workflows
export interface AgentConfig {
    name: string;
    instructions: string;
    tools?: DatabaseTool[];
}

// Database tool interface (from tools.ts)
interface DatabaseTool {
  name: string;
  description: string;
  parameters: {
    type: Type.OBJECT;
    properties: Record<string, Schema>;
    required: string[];
  };
  function: (args: unknown) => Promise<unknown>;
}

// Agent output interface
export interface AgentOutput {
    finalOutput: string;
}

// Agent class for agentic AI workflows with tool calling
export class Agent {
    name: string;
    instructions: string;
    tools: DatabaseTool[];

    constructor(config: AgentConfig) {
        this.name = config.name;
        this.instructions = config.instructions;
        this.tools = config.tools || [];
    }
}

// Run function for executing agent workflows
export async function run(agent: Agent, input: string): Promise<AgentOutput> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required");
    }

    const genAI = new GoogleGenAI({ apiKey });
    
    // Convert tools to Google GenAI format - simple pass-through since types match
    const functionDeclarations = agent.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: {
            type: Type.OBJECT,
            properties: tool.parameters.properties,
            required: tool.parameters.required
        }
    }));

    const model = process.env.GEN_MODEL || "gemini-1.5-flash";
    
    try {
        const response = await genAI.models.generateContent({
            model,
            contents: input,
            config: {
                systemInstruction: [agent.instructions],
                ...(functionDeclarations.length > 0 ? {
                    tools: [{ functionDeclarations }]
                } : {})
            }
        });

        const finalOutput = response.text || "";
        
        // Handle function calls if any
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.functionCall) {
                    // Find and execute the tool
                    const tool = agent.tools.find(t => t.name === part.functionCall?.name);
                    if (tool && tool.function) {
                        const result = await tool.function(part.functionCall.args);
                        console.log(`Tool ${part.functionCall.name} executed:`, result);
                    }
                }
            }
        }

        return { finalOutput };
    } catch (error) {
        console.error("Error in agent run:", error);
        throw error;
    }
}

// Default agent class for media generation
class MediaGenerationAgent {
    private genAI: GoogleGenAI | null = null;

    private getClient(): GoogleGenAI {
        if (!this.genAI) {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("GEMINI_API_KEY environment variable is required for media generation");
            }
            this.genAI = new GoogleGenAI({ apiKey });
        }
        return this.genAI;
    }

    async getDescription(dreams: string): Promise<string> {
        const model = process.env.GEN_MODEL || "gemini-1.5-flash";
        const response = await this.getClient().models.generateContent({
            model,
            contents: dreams,
            config: {
                systemInstruction: [`
                You are a dream world synthesizer that creates a surreal, dreamlike interpretation of collective dreams.
                Analyze the dreams provided and synthesize them into a world description with the following elements:
                
                1. **Atmosphere**: Overall mood and ambiance of the dream world
                2. **Dominant Themes**: Main recurring themes across dreams
                3. **Emotional Landscape**: The collective emotional state
                4. **Visual Elements**: Key visual motifs, colors, and imagery
                5. **Symbolic Entities**: Recurring symbols or archetypes
                6. **World Characteristics**: Physical or metaphysical properties of this dreamscape
                
                Return a single, descriptive paragraph that reads like a rich, artistic description.
                No markdown or JSON allowed in responses.
                `
                ],
            },
        });

        return response.text || "";
    }

    async getVideo(_prompt: string, _img?: string | null): Promise<string> {
        // Video generation is expensive and disabled for free tier
        // Return empty string to indicate no video generated
        console.log("Video generation is disabled (expensive)");
        return "";
    }

    async getImage(type: string, _prompt: string, _img?: { data: string; mimeType: string; } | null): Promise<string> {
        // Image generation is expensive and disabled for free tier
        // Return empty string to indicate no image generated
        console.log(`Image generation (${type}) is disabled (expensive)`);
        return "";
    }

    async getMusic(_prompt: string): Promise<string> {
        // Music generation is expensive and disabled for free tier
        // Return empty string to indicate no music generated
        console.log("Music generation is disabled (expensive)");
        return "";
    }
}

const mediaGenerationAgent = new MediaGenerationAgent();
export default mediaGenerationAgent;
