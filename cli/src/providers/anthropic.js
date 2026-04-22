import { LLMProvider } from './base.js';

export class AnthropicProvider extends LLMProvider {
  constructor(config) {
    super(config);
    this.name = 'anthropic';
    this.baseUrl = 'https://api.anthropic.com/v1';
    this.apiKey = config.provider?.apiKey ?? process.env.ANTHROPIC_API_KEY;
    this.model = config.provider?.model ?? 'claude-3-5-sonnet-20241022';
  }

  get capabilities() {
    return {
      supportsJsonMode: false,
      supportsStreaming: true,
      requiresApiKey: true,
      supportedModels: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
      maxContextTokens: 200000,
    };
  }

  async complete(messages, options = {}) {
    const { temperature = 0.1, maxTokens = 2048 } = options;

    const systemMessage = messages.find(m => m.role === 'system')?.content ?? '';
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    const body = {
      model: this.model,
      messages: nonSystemMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
      max_tokens: maxTokens,
    };

    if (systemMessage) {
      body.system = systemMessage;
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const usage = data.usage || {};

    return {
      content: data.content?.[0]?.text ?? '',
      usage: {
        promptTokens: usage.input_tokens ?? 0,
        completionTokens: usage.output_tokens ?? 0,
        totalTokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
      },
      model: this.model,
      provider: this.name,
      durationMs: Date.now(),
    };
  }

  async *stream(messages, options = {}) {
    const { temperature = 0.1, maxTokens = 2048 } = options;

    const systemMessage = messages.find(m => m.role === 'system')?.content ?? '';
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'anthropic-beta': 'interleaved-thinking-2025-05-14',
      },
      body: JSON.stringify({
        model: this.model,
        messages: nonSystemMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
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
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.delta?.text;
              if (delta) yield delta;
              if (parsed.type === 'message_stop') return;
            } catch {}
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async ping() {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }],
      }),
    });
    if (!response.ok) throw new Error(`Ping failed: ${response.status}`);
    return true;
  }
}