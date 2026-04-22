import { LLMProvider } from './base.js';

export class OpenAIProvider extends LLMProvider {
  constructor(config) {
    super(config);
    this.name = 'openai';
    this.baseUrl = 'https://api.openai.com/v1';
    this.apiKey = config.provider?.apiKey ?? process.env.OPENAI_API_KEY;
    this.model = config.provider?.model ?? 'gpt-4o';
  }

  get capabilities() {
    return {
      supportsJsonMode: true,
      supportsStreaming: true,
      requiresApiKey: true,
      supportedModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      maxContextTokens: 128000,
    };
  }

  async complete(messages, options = {}) {
    const { temperature = 0.1, maxTokens = 2048, responseFormat } = options;

    const body = {
      model: this.model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    if (responseFormat === 'json' || this.config.provider?.supportsJsonMode) {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const usage = data.usage || {};
    const durationMs = Date.now();

    return {
      content: data.choices?.[0]?.message?.content ?? '',
      usage: {
        promptTokens: usage.prompt_tokens ?? 0,
        completionTokens: usage.completion_tokens ?? 0,
        totalTokens: usage.total_tokens ?? 0,
      },
      model: this.model,
      provider: this.name,
      durationMs,
    };
  }

  async *stream(messages, options = {}) {
    const { temperature = 0.1, maxTokens = 2048 } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) yield delta;
            } catch {}
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async ping() {
    const response = await fetch(`${this.baseUrl}/models/${this.model}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    });
    if (!response.ok) throw new Error(`Ping failed: ${response.status}`);
    return true;
  }
}