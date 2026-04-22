import { OpenAIProvider } from './openai.js';
import { ConfigError } from './base.js';

export class OpenAICompatibleProvider extends OpenAIProvider {
  constructor(config) {
    super(config);
    this.name = 'openai-compatible';

    if (!config.provider?.baseUrl) {
      throw new ConfigError(
        '"openai-compatible" provider requires config.provider.baseUrl. ' +
        'Example: "https://api.groq.com/openai/v1"'
      );
    }

    this.baseUrl = config.provider.baseUrl;
    this.apiKey = config.provider?.apiKey ?? process.env.AI_CSS_KIT_API_KEY;
    this.model = config.provider?.model ?? 'unknown';
  }

  get capabilities() {
    return {
      supportsJsonMode: this.config.provider?.supportsJsonMode ?? false,
      supportsStreaming: true,
      requiresApiKey: this.config.provider?.requiresApiKey ?? true,
      supportedModels: undefined,
      maxContextTokens: this.config.provider?.maxContextTokens,
    };
  }

  async ping() {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {},
    });
    if (!response.ok) throw new Error(`Ping failed: ${response.status}`);
    return true;
  }
}