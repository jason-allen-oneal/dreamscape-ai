import { GoogleGenerativeAI, GenerativeModel, Part, Tool } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface AgentConfig {
  name: string;
  instructions: string;
  tools?: any[];
}

export class Agent {
  name: string;
  instructions: string;
  tools: any[];
  model: GenerativeModel;

  constructor(config: AgentConfig) {
    this.name = config.name;
    this.instructions = config.instructions;
    this.tools = config.tools || [];
    
    // Initialize Gemini model with function calling support
    const modelConfig: any = {
      model: 'gemini-2.5-flash',
      systemInstruction: this.instructions,
    };

    // Convert tools to Gemini format if provided
    if (this.tools.length > 0) {
      modelConfig.tools = this.convertToolsToGeminiFormat(this.tools);
    }

    this.model = genAI.getGenerativeModel(modelConfig);
  }

  private convertToolsToGeminiFormat(tools: any[]): Tool[] {
    return [{
      functionDeclarations: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters || {
          type: 'object',
          properties: {},
          required: []
        }
      }))
    }];
  }

  async executeToolCall(toolName: string, args: any): Promise<any> {
    const tool = this.tools.find(t => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }
    
    // Execute the tool function
    if (typeof tool.function === 'function') {
      return await tool.function(args);
    }
    
    throw new Error(`Tool ${toolName} does not have a valid function property`);
  }
}

export interface RunResult {
  finalOutput: string;
  toolCalls?: any[];
}

export async function run(agent: Agent, prompt: string): Promise<RunResult> {
  const normalizeToolResponse = (response: any) => {
    if (response === null || response === undefined) {
      return {};
    }

    if (typeof response === 'object' && !Array.isArray(response)) {
      if (response instanceof Date) {
        return { result: response.toISOString() };
      }

      if (typeof response.toJSON === 'function') {
        try {
          return response.toJSON();
        } catch (error) {
          console.warn('Failed to call toJSON on tool response:', error);
        }
      }

      try {
        return JSON.parse(JSON.stringify(response));
      } catch (error) {
        console.warn('Failed to serialize tool response object, falling back to string:', error);
        return { result: String(response) };
      }
    }

    if (Array.isArray(response)) {
      return { items: response };
    }

    return { result: response };
  };

  try {
    const chat = agent.model.startChat({
      history: [],
    });

    let finalOutput = '';
    let continueLoop = true;
    const maxIterations = 10; // Prevent infinite loops
    let iteration = 0;
    let isFirstMessage = true;
    let pendingResult: any = null;

    while (continueLoop && iteration < maxIterations) {
      iteration++;
      let result;

      if (pendingResult) {
        result = pendingResult;
        pendingResult = null;
      } else if (isFirstMessage) {
        result = await chat.sendMessage(prompt);
        isFirstMessage = false;
      } else {
        // No content to send and no pending response; exit loop safely
        break;
      }

      const response = result.response;
      
      // Check if there are function calls
      const functionCalls = response.functionCalls();
      
      if (functionCalls && functionCalls.length > 0) {
        // Execute each function call
        const functionResponses = [];
        
        for (const call of functionCalls) {
          try {
            const toolResult = await agent.executeToolCall(call.name, call.args);
            functionResponses.push({
              name: call.name,
              response: normalizeToolResponse(toolResult)
            });
          } catch (error) {
            console.error(`Error executing tool ${call.name}:`, error);
            functionResponses.push({
              name: call.name,
              response: { error: String(error) }
            });
          }
        }
        
        // Send function responses back to the model
        const functionResponseParts: Part[] = functionResponses.map(fr => ({
          functionResponse: {
            name: fr.name,
            response: fr.response
          }
        }));
        
        // Continue the conversation with function results
        const followUpResult = await chat.sendMessage(functionResponseParts);
        const moreFunctionCalls = followUpResult.response.functionCalls();
        if (moreFunctionCalls && moreFunctionCalls.length > 0) {
          pendingResult = followUpResult;
        } else {
          finalOutput = followUpResult.response.text();
          continueLoop = false;
        }
        continue;
      } else {
        // No function calls, just get the text response
        finalOutput = response.text();
        continueLoop = false;
      }
    }

    return {
      finalOutput,
    };
  } catch (error) {
    console.error('Error running Gemini agent:', error);
    throw error;
  }
}

export function setDefaultGeminiKey(key: string): void {
  // This is handled via environment variable in the constructor
  // Just a placeholder for API compatibility
  if (!key) {
    console.warn('Gemini API key not provided');
  }
}