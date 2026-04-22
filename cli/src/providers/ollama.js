import { LLMProvider } from './base.js';

export class OllamaProvider extends LLMProvider {
  constructor(config) {
    super(config);
    this.name = 'ollama';
    this.baseUrl = config.ollama?.baseUrl ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
    this.model = config.ollama?.model ?? config.provider?.model ?? 'llama3';
  }

  get capabilities() {
    return {
      supportsJsonMode: true,
      supportsStreaming: true,
      requiresApiKey: false,
      supportedModels: undefined,
      maxContextTokens: undefined,
    };
  }

  async complete(messages, options = {}) {
    const { temperature = 0.1, maxTokens = 2048 } = options;

    const systemMessage = messages.find(m => m.role === 'system')?.content ?? '';
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    const body = {
      model: this.model,
      messages: [
        ...(systemMessage ? [{ role: 'system', content: systemMessage }] : []),
        ...nonSystemMessages.map(m => ({ role: m.role, content: m.content })),
      ],
      temperature,
      options: { num_predict: maxTokens },
      stream: false,
      format: 'json',
    };

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const usage = data.prompt_eval_count || {};
    const durationMs = Date.now();

    return {
      content: data.message?.content ?? '',
      usage: {
        promptTokens: typeof usage === 'object' ? (usage.prompt_eval_count ?? 0) : (usage ?? 0),
        completionTokens: typeof usage === 'object' ? (usage.eval_count ?? 0) : 0,
        totalTokens: 0,
      },
      model: this.model,
      provider: this.name,
      durationMs,
    };
  }

  async *stream(messages, options = {}) {
    const { temperature = 0.1, maxTokens = 2048 } = options;

    const systemMessage = messages.find(m => m.role === 'system')?.content ?? '';
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          ...(systemMessage ? [{ role: 'system', content: systemMessage }] : []),
          ...nonSystemMessages.map(m => ({ role: m.role, content: m.content })),
        ],
        temperature,
        options: { num_predict: maxTokens },
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
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
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              const delta = parsed.message?.content;
              if (delta) yield delta;
              if (parsed.done) return;
            } catch {}
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async ping() {
    const response = await fetch(`${this.baseUrl}/api/tags`, { method: 'GET' });
    if (!response.ok) throw new Error(`Ping failed: ${response.status}`);
    return true;
  }
}