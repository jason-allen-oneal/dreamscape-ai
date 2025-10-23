import {
  GenerateContentResult,
  GoogleGenerativeAI,
  GenerativeModel,
  Part,
  Tool,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export interface ToolDefinition {
  name: string;
  description: string;
  parameters?: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
  function?: (args: unknown) => unknown | Promise<unknown>;
}

export interface AgentConfig {
  name: string;
  instructions: string;
  tools?: ToolDefinition[];
}

export class Agent {
  readonly name: string;
  readonly instructions: string;
  readonly tools: ToolDefinition[];
  readonly model: GenerativeModel;

  constructor(config: AgentConfig) {
    this.name = config.name;
    this.instructions = config.instructions;
    this.tools = config.tools ?? [];

    const modelConfig: {
      model: string;
      systemInstruction: string;
      tools?: Tool[];
    } = {
      model: "gemini-2.5-flash",
      systemInstruction: this.instructions,
    };

    if (this.tools.length > 0) {
      modelConfig.tools = this.convertToolsToGeminiFormat(this.tools);
    }

    this.model = genAI.getGenerativeModel(modelConfig);
  }

  private convertToolsToGeminiFormat(tools: ToolDefinition[]): Tool[] {
    return [
      {
        functionDeclarations: tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          parameters:
            tool.parameters ?? {
              type: "object",
              properties: {},
              required: [],
            },
        })),
      },
    ];
  }

  async executeToolCall(toolName: string, args: unknown): Promise<unknown> {
    const tool = this.tools.find((t) => t.name === toolName);
    if (!tool || typeof tool.function !== "function") {
      throw new Error(`Tool ${toolName} not found or has no executable function`);
    }

    return tool.function(args);
  }
}

export interface RunResult {
  finalOutput: string;
}

const normalizeToolResponse = (response: unknown): Record<string, unknown> => {
  if (response === null || response === undefined) {
    return {};
  }

  if (Array.isArray(response)) {
    return { items: response } as Record<string, unknown>;
  }

  if (response instanceof Date) {
    return { result: response.toISOString() };
  }

  if (typeof response === "object") {
    const maybeJson = response as { toJSON?: () => unknown };
    if (typeof maybeJson.toJSON === "function") {
      try {
        const jsonValue = maybeJson.toJSON();
        if (jsonValue && typeof jsonValue === "object") {
          return jsonValue as Record<string, unknown>;
        }
        return { result: jsonValue } as Record<string, unknown>;
      } catch (error) {
        console.warn("Failed to call toJSON on tool response:", error);
      }
    }

    try {
      return JSON.parse(JSON.stringify(response)) as Record<string, unknown>;
    } catch (error) {
      console.warn(
        "Failed to serialize tool response object, falling back to string:",
        error,
      );
      return { result: String(response) };
    }
  }

  return { result: response } as Record<string, unknown>;
};

export async function run(agent: Agent, prompt: string): Promise<RunResult> {
  try {
    const chat = agent.model.startChat({ history: [] });

    let finalOutput = "";
    let continueLoop = true;
    const maxIterations = 10;
    let iteration = 0;
    let isFirstMessage = true;
    let pendingResult: GenerateContentResult | null = null;

    while (continueLoop && iteration < maxIterations) {
      iteration += 1;

      let result: GenerateContentResult;
      if (pendingResult) {
        result = pendingResult;
        pendingResult = null;
      } else if (isFirstMessage) {
        result = await chat.sendMessage(prompt);
        isFirstMessage = false;
      } else {
        break;
      }

      const response = result.response;
      const functionCalls = response.functionCalls?.();

      if (functionCalls && functionCalls.length > 0) {
        const functionResponses: Array<{
          name: string;
          response: Record<string, unknown>;
        }> = [];

        for (const call of functionCalls) {
          try {
            const toolResult = await agent.executeToolCall(call.name, call.args);
            functionResponses.push({
              name: call.name,
              response: normalizeToolResponse(toolResult),
            });
          } catch (error) {
            console.error(`Error executing tool ${call.name}:`, error);
            functionResponses.push({
              name: call.name,
              response: { error: String(error) },
            });
          }
        }

        const functionResponseParts: Part[] = functionResponses.map(
          (toolResponse) => ({
            functionResponse: {
              name: toolResponse.name,
              response: toolResponse.response,
            },
          }),
        );

        const followUpResult = await chat.sendMessage(functionResponseParts);
        const moreFunctionCalls = followUpResult.response.functionCalls?.();

        if (moreFunctionCalls && moreFunctionCalls.length > 0) {
          pendingResult = followUpResult;
        } else {
          finalOutput = followUpResult.response.text() ?? "";
          continueLoop = false;
        }
      } else {
        finalOutput = response.text() ?? "";
        continueLoop = false;
      }
    }

    return { finalOutput };
  } catch (error) {
    console.error("Error running Gemini agent:", error);
    throw error;
  }
}

export function setDefaultGeminiKey(key: string): void {
  if (!key) {
    console.warn("Gemini API key not provided");
  }
}
