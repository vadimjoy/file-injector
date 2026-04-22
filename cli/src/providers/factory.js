import { ConfigError } from './base.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { OllamaProvider } from './ollama.js';
import { OpenAICompatibleProvider } from './openai-compatible.js';

const BUILT_IN_REGISTRY = {
  'openai': OpenAIProvider,
  'anthropic': AnthropicProvider,
  'ollama': OllamaProvider,
  'openai-compatible': OpenAICompatibleProvider,
};

const _customRegistry = new Map();

export function registerProvider(name, ProviderClass) {
  if (typeof name !== 'string' || !name.trim()) {
    throw new TypeError('registerProvider: name must be a non-empty string');
  }
  if (!(ProviderClass.prototype instanceof (BUILT_IN_REGISTRY['openai']))) {
    throw new TypeError(
      `registerProvider: "${name}" must extend LLMProvider`
    );
  }
  if (BUILT_IN_REGISTRY[name]) {
    throw new ConfigError(
      `registerProvider: "${name}" conflicts with a built-in provider. Choose a different name.`
    );
  }
  _customRegistry.set(name, ProviderClass);
}

export function listProviders() {
  return [...Object.keys(BUILT_IN_REGISTRY), ..._customRegistry.keys()];
}

export function createProvider(config) {
  const name = config.provider?.provider ?? 'openai';
  const Cls = _customRegistry.get(name) ?? BUILT_IN_REGISTRY[name];

  if (!Cls) {
    throw new ConfigError(
      `Unknown provider: "${name}". ` +
      `Built-in: ${Object.keys(BUILT_IN_REGISTRY).join(', ')}. ` +
      `Custom registered: ${[..._customRegistry.keys()].join(', ') || '(none)'}`
    );
  }

  const instance = new Cls(config);

  if (instance.capabilities.requiresApiKey && !config.provider?.apiKey) {
    const envKey = name === 'anthropic' ? 'ANTHROPIC_API_KEY'
      : name === 'openai' ? 'OPENAI_API_KEY'
      : 'AI_CSS_KIT_API_KEY';
    if (!process.env[envKey]) {
      throw new ConfigError(
        `Provider "${name}" requires an API key. ` +
        `Set it via environment variable ${envKey} or config.provider.apiKey.`
      );
    }
  }

  return instance;
}