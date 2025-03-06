/**
 * Settings for configuring LLM calls
 */
export interface LLMSettings {
  provider: string           // e.g. "ollama", "azureOpenAI", "bedrock", etc.
  model?: string             // e.g. "llama2", "gpt-4", etc.
  temperature?: number       // Controls randomness (0.0 to 1.0)
  maxTokens?: number         // Max tokens in response
  apiKey?: string            // API key (for cloud providers)
  apiEndpoint?: string       // Custom endpoint URL (if not using defaults)
}

/**
 * Interface for LLM service providers
 */
export interface LLMService {
  callLLM(prompt: string, settings: LLMSettings): Promise<string>
}

/**
 * Mock LLM service for testing or when no real LLM is available
 */
class DummyService implements LLMService {
  async callLLM(prompt: string, settings: LLMSettings): Promise<string> {
    return `[SIMULATED LLM RESPONSE]
I've analyzed your request and here is my response:

The prompt you provided was:
---
${prompt}
---

This is a simulated response because no actual LLM provider was configured or available.
If you want real responses, please configure a provider like 'ollama' or 'azureOpenAI'.
`;
  }
}

/**
 * Service for connecting to local Ollama instance
 */
class OllamaService implements LLMService {
  async callLLM(prompt: string, settings: LLMSettings): Promise<string> {
    try {
      const model = settings.model || 'llama2';
      const temperature = settings.temperature ?? 0.7;
      const endpoint = settings.apiEndpoint || 'http://localhost:11434';
      
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          temperature,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || 'No response from Ollama';
    } catch (error) {
      console.error('Ollama LLM call failed:', error);
      return `Error calling Ollama: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}

/**
 * Service for connecting to Azure OpenAI
 */
class AzureOpenAIService implements LLMService {
  async callLLM(prompt: string, settings: LLMSettings): Promise<string> {
    try {
      if (!settings.apiKey) {
        throw new Error('Azure OpenAI API key is required');
      }
      
      if (!settings.apiEndpoint) {
        throw new Error('Azure OpenAI endpoint is required');
      }
      
      const model = settings.model || 'gpt-4';
      const temperature = settings.temperature ?? 0.7;
      const maxTokens = settings.maxTokens || 1000;
      
      const response = await fetch(`${settings.apiEndpoint}/openai/deployments/${model}/completions?api-version=2023-05-15`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': settings.apiKey
        },
        body: JSON.stringify({
          prompt,
          temperature,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) {
        throw new Error(`Azure OpenAI request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.text || 'No response from Azure OpenAI';
    } catch (error) {
      console.error('Azure OpenAI LLM call failed:', error);
      return `Error calling Azure OpenAI: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}

/**
 * Get the appropriate LLM service based on settings
 */
export function getLLMService(settings: LLMSettings): LLMService {
  switch (settings.provider) {
    case 'ollama':
      return new OllamaService();
    case 'azureOpenAI':
      return new AzureOpenAIService();
    // Additional providers can be added here
    default:
      console.warn(`No LLM provider found for "${settings.provider}". Using dummy service.`);
      return new DummyService();
  }
}

/**
 * Default LLM settings to use when none are provided
 */
export const DEFAULT_LLM_SETTINGS: LLMSettings = {
  provider: 'dummy',
  model: 'default',
  temperature: 0.7,
  maxTokens: 1000
}; 