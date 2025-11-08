/**
 * Example Usage of OpenAI Integration
 * 
 * This file demonstrates how to use the AI provider abstraction to work with both
 * Gemini and OpenAI seamlessly.
 */

// Example 1: Using the unified AI provider (automatically selects based on AI_PROVIDER env var)
// This is the recommended approach for most use cases

import { Agent, run, getDescription } from "@/lib/ai-provider";

// Create an agent for dream analysis
async function analyzeDreamWithUnifiedProvider(dreamText: string) {
    const dreamAgent = new Agent({
        name: "Dream Analyzer",
        instructions: `You are an expert dream analyst. Analyze the dream and provide insights in JSON format with these fields:
        - summary: A brief summary of the dream
        - emotion: The primary emotion (JOY, SADNESS, FEAR, etc.)
        - symbols: An array of key symbols found in the dream
        - interpretation: A brief interpretation`,
        tools: [], // Optional: add database tools if needed
    });

    const result = await run(dreamAgent, dreamText);
    return JSON.parse(result.finalOutput);
}

// Example 2: Using provider-specific modules directly
// Use this when you need provider-specific features

import * as GeminiProvider from "@/lib/gemini";
import * as OpenAIProvider from "@/lib/openai";

// Force use of Gemini
async function analyzeDreamWithGemini(dreamText: string) {
    const dreamAgent = new GeminiProvider.Agent({
        name: "Dream Analyzer",
        instructions: "Analyze this dream...",
        tools: [],
    });

    return await GeminiProvider.run(dreamAgent, dreamText);
}

// Force use of OpenAI
async function analyzeDreamWithOpenAI(dreamText: string) {
    const dreamAgent = new OpenAIProvider.Agent({
        name: "Dream Analyzer", 
        instructions: "Analyze this dream...",
        tools: [],
    });

    return await OpenAIProvider.run(dreamAgent, dreamText);
}

// Example 3: Generate descriptions (world synthesis)

async function generateDreamWorldDescription(dreamSummaries: string) {
    // Uses whichever provider is configured
    const description = await getDescription(dreamSummaries);
    return description;
}

// Example 4: Environment-based provider selection

function getCurrentProvider() {
    return process.env.AI_PROVIDER || "gemini";
}

// Example usage in API routes:
/*
// In your API route (e.g., /api/dreams/new/route.ts)

import { Agent, run } from "@/lib/ai-provider";

export async function POST(req: NextRequest) {
    const { rawText } = await req.json();
    
    const dreamAgent = new Agent({
        name: "Dream Classifier",
        instructions: "Classify this dream and extract structured data...",
        tools: dbTools,
    });
    
    const result = await run(dreamAgent, rawText);
    const parsed = JSON.parse(result.finalOutput);
    
    // Use the parsed data...
    return NextResponse.json({ data: parsed });
}
*/

// Configuration Examples:

/*
1. Use Gemini (Free):
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_key
   GEN_MODEL=gemini-1.5-flash

2. Use OpenAI (Paid):
   AI_PROVIDER=openai
   OPENAI_API_KEY=your_key
   OPENAI_MODEL=gpt-4o-mini

3. Enable OpenAI Image Generation:
   AI_PROVIDER=openai
   OPENAI_API_KEY=your_key
   OPENAI_MODEL=gpt-4o-mini
   OPENAI_IMAGE_MODEL=dall-e-3
*/

export {
    analyzeDreamWithUnifiedProvider,
    analyzeDreamWithGemini,
    analyzeDreamWithOpenAI,
    generateDreamWorldDescription,
    getCurrentProvider,
};
