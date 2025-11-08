// Unified AI provider abstraction - allows switching between Gemini and OpenAI
import * as GeminiProvider from "./gemini";
import * as OpenAIProvider from "./openai";

// Define which provider to use based on environment variable
const AI_PROVIDER = process.env.AI_PROVIDER || "gemini";

interface AgentConfig {
    name: string;
    instructions: string;
    tools?: unknown[];
}

interface AgentResult {
    finalOutput: string;
    toolCalls?: unknown[];
}

// Export Agent class that delegates to the selected provider
export class Agent {
    private config: AgentConfig;
    private provider: typeof AI_PROVIDER;

    constructor(config: AgentConfig) {
        this.config = config;
        this.provider = AI_PROVIDER;
    }

    async execute(userMessage: string): Promise<AgentResult> {
        if (this.provider === "openai") {
            const agent = new OpenAIProvider.Agent(this.config);
            return await agent.execute(userMessage);
        } else {
            // Default to Gemini
            const agent = new GeminiProvider.Agent(this.config);
            return await agent.execute(userMessage);
        }
    }
}

// Export run function
export async function run(agent: Agent, userMessage: string): Promise<AgentResult> {
    return await agent.execute(userMessage);
}

// Export helper functions that delegate to the selected provider
export async function getDescription(prompt: string): Promise<string> {
    if (AI_PROVIDER === "openai") {
        return await OpenAIProvider.getDescription(prompt);
    } else {
        const geminiAgent = GeminiProvider.default;
        return await geminiAgent.getDescription(prompt);
    }
}

export async function getImage(type: string, prompt: string): Promise<string> {
    if (AI_PROVIDER === "openai") {
        return await OpenAIProvider.getImage(type, prompt);
    } else {
        const geminiAgent = GeminiProvider.default;
        return await geminiAgent.getImage(type, prompt);
    }
}

export async function getVideo(prompt: string): Promise<string> {
    if (AI_PROVIDER === "openai") {
        // OpenAI doesn't support video generation yet
        throw new Error("Video generation is not supported with OpenAI provider");
    } else {
        const geminiAgent = GeminiProvider.default;
        return await geminiAgent.getVideo(prompt);
    }
}

export async function getMusic(prompt: string): Promise<string> {
    if (AI_PROVIDER === "openai") {
        // OpenAI doesn't support music generation
        throw new Error("Music generation is not supported with OpenAI provider");
    } else {
        const geminiAgent = GeminiProvider.default;
        return await geminiAgent.getMusic(prompt);
    }
}

export function parseGeminiJSON(raw: string) {
    return GeminiProvider.parseGeminiJSON(raw);
}

// Export the selected provider name for informational purposes
export const currentProvider = AI_PROVIDER;

// Default export combining all functionality
const aiProvider = {
    Agent,
    run,
    getDescription,
    getImage,
    getVideo,
    getMusic,
    parseGeminiJSON,
    currentProvider,
};

export default aiProvider;
