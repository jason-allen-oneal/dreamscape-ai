// OpenAI integration module - optional alternative to Gemini
import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";

interface AgentConfig {
    name: string;
    instructions: string;
    tools?: unknown[];
}

interface AgentResult {
    finalOutput: string;
    toolCalls?: unknown[];
}

// OpenAI Agent implementation
export class Agent {
    private config: AgentConfig;
    private client: OpenAI;

    constructor(config: AgentConfig) {
        this.config = config;
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY environment variable is required for OpenAI integration");
        }
        this.client = new OpenAI({ apiKey });
    }

    async execute(userMessage: string): Promise<AgentResult> {
        const messages: ChatCompletionMessageParam[] = [
            { role: "system", content: this.config.instructions },
            { role: "user", content: userMessage }
        ];

        const tools: ChatCompletionTool[] = [];
        
        // Convert database tools to OpenAI format if provided
        if (this.config.tools && Array.isArray(this.config.tools)) {
            for (const tool of this.config.tools) {
                if (typeof tool === 'object' && tool !== null && 'name' in tool && 'description' in tool && 'parameters' in tool) {
                    tools.push({
                        type: "function",
                        function: {
                            name: tool.name as string,
                            description: tool.description as string,
                            parameters: tool.parameters as Record<string, unknown>,
                        }
                    });
                }
            }
        }

        const completion = await this.client.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages,
            tools: tools.length > 0 ? tools : undefined,
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const responseMessage = completion.choices[0]?.message;
        if (!responseMessage) {
            throw new Error("No response from OpenAI");
        }

        return {
            finalOutput: responseMessage.content || "",
            toolCalls: responseMessage.tool_calls || [],
        };
    }
}

// Export run function for executing agents
export async function run(agent: Agent, userMessage: string): Promise<AgentResult> {
    return await agent.execute(userMessage);
}

// Helper function to generate text descriptions using OpenAI
export async function getDescription(prompt: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is required");
    }

    const client = new OpenAI({ apiKey });
    
    const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are a dream world synthesizer that creates a surreal, dreamlike interpretation of collective dreams.
Analyze the dreams provided and synthesize them into a world description with the following elements:

1. **Atmosphere**: Overall mood and ambiance of the dream world
2. **Dominant Themes**: Main recurring themes across dreams
3. **Emotional Landscape**: The collective emotional state
4. **Visual Elements**: Key visual motifs, colors, and imagery
5. **Symbolic Entities**: Recurring symbols or archetypes
6. **World Characteristics**: Physical or metaphysical properties of this dreamscape

Return a single, descriptive paragraph that reads like a rich, artistic description.
No markdown or JSON allowed in responses.`
            },
            { role: "user", content: prompt }
        ],
        temperature: 0.8,
    });

    return completion.choices[0]?.message?.content || "";
}

// Helper function for image generation using DALL-E
export async function getImage(type: string, prompt: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is required");
    }

    const client = new OpenAI({ apiKey });

    let enhancedPrompt = prompt;
    if (type === 'background') {
        enhancedPrompt = `A surreal, dreamlike, abstract background that captures the essence of the following dream world description: ${prompt}`;
    } else if (type.includes("floating")) {
        enhancedPrompt = `A surreal, dreamlike, abstract floating object that would exist in the following dream world: ${prompt}`;
    }

    const response = await client.images.generate({
        model: process.env.OPENAI_IMAGE_MODEL || "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
    });

    if (!response.data || response.data.length === 0) {
        throw new Error("No image data returned from OpenAI");
    }

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
        throw new Error("No image URL returned from OpenAI");
    }

    // Note: In production, you'd want to download and save the image
    // For now, we return the URL
    return imageUrl;
}

// Default export for backward compatibility
const openaiModule = {
    Agent,
    run,
    getDescription,
    getImage,
};

export default openaiModule;
