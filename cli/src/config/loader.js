import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULTS = {
  provider: {
    provider: 'openai',
    model: 'gpt-4o',
    apiKey: undefined,
    baseUrl: undefined,
  },
  generate: {
    defaultTheme: 'default',
    defaultSize: 'md',
    defaultLayout: 'form',
    maxTokens: 2048,
    temperature: 0.1,
    validate: true,
    outputFormat: 'html',
  },
  validate: {
    rules: {},
    failOn: 'error',
  },
  ollama: {
    baseUrl: 'http://localhost:11434',
    model: 'llama3',
  },
};

function deepMerge(target, ...sources) {
  const result = { ...target };
  for (const source of sources) {
    if (!source) continue;
    for (const key of Object.keys(source)) {
      if (source[key] !== undefined && source[key] !== null) {
        if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = deepMerge(result[key] ?? {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
  }
  return result;
}

async function findAndLoadConfigFile() {
  let dir = process.cwd();
  while (true) {
    const candidate = resolve(dir, '.ai-css-kit.config.js');
    if (existsSync(candidate)) {
      try {
        const mod = await import(pathToFileURL(candidate).href);
        return mod.default ?? mod;
      } catch {
        return {};
      }
    }
    const parent = dirname(dir);
    if (parent === dir) return {};
    dir = parent;
  }
}

function loadEnvConfig() {
  const config = {};
  if (process.env.AI_CSS_KIT_PROVIDER) {
    config.provider = { ...(config.provider ?? {}), provider: process.env.AI_CSS_KIT_PROVIDER };
  }
  if (process.env.AI_CSS_KIT_MODEL) {
    config.provider = { ...(config.provider ?? {}), model: process.env.AI_CSS_KIT_MODEL };
  }
  if (process.env.OPENAI_API_KEY && process.env.AI_CSS_KIT_PROVIDER === 'openai') {
    config.provider = { ...(config.provider ?? {}), apiKey: process.env.OPENAI_API_KEY };
  }
  if (process.env.ANTHROPIC_API_KEY && process.env.AI_CSS_KIT_PROVIDER === 'anthropic') {
    config.provider = { ...(config.provider ?? {}), apiKey: process.env.ANTHROPIC_API_KEY };
  }
  if (process.env.AI_CSS_KIT_BASE_URL) {
    config.provider = { ...(config.provider ?? {}), baseUrl: process.env.AI_CSS_KIT_BASE_URL };
  }
  if (process.env.OLLAMA_BASE_URL) {
    config.ollama = { ...(config.ollama ?? {}), baseUrl: process.env.OLLAMA_BASE_URL };
  }
  if (process.env.AI_CSS_KIT_TEMPERATURE) {
    config.generate = { ...(config.generate ?? {}), temperature: parseFloat(process.env.AI_CSS_KIT_TEMPERATURE) };
  }
  if (process.env.AI_CSS_KIT_MAX_TOKENS) {
    config.generate = { ...(config.generate ?? {}), maxTokens: parseInt(process.env.AI_CSS_KIT_MAX_TOKENS) };
  }
  return config;
}

export async function loadConfig(cliFlags = {}) {
  const fileConfig = await findAndLoadConfigFile();
  const envConfig = loadEnvConfig();
  return deepMerge({}, DEFAULTS, fileConfig, envConfig, normalizeCLIFlags(cliFlags));
}

function normalizeCLIFlags(flags) {
  const config = {};
  if (!flags) return config;

  if (flags.provider) {
    config.provider = { ...(config.provider ?? {}), provider: flags.provider };
  }
  if (flags.model) {
    config.provider = { ...(config.provider ?? {}), model: flags.model };
  }
  if (flags.theme) {
    config.generate = { ...(config.generate ?? {}), defaultTheme: flags.theme };
  }
  if (flags.format) {
    config.generate = { ...(config.generate ?? {}), outputFormat: flags.format };
  }
  if (typeof flags.validate === 'boolean') {
    config.generate = { ...(config.generate ?? {}), validate: flags.validate };
  }
  if (flags.temperature !== undefined) {
    config.generate = { ...(config.generate ?? {}), temperature: flags.temperature };
  }
  if (flags.maxTokens !== undefined) {
    config.generate = { ...(config.generate ?? {}), maxTokens: flags.maxTokens };
  }
  if (flags.output) {
    config.output = { file: flags.output };
  }
  return config;
}