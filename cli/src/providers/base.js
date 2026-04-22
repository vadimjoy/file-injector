export class LLMProvider {
  constructor(config) {
    this.config = config;
    this.name = 'base';
  }

  get capabilities() {
    return {
      supportsJsonMode: false,
      supportsStreaming: false,
      requiresApiKey: true,
      supportedModels: undefined,
      maxContextTokens: undefined,
    };
  }

  async complete(messages, options = {}) {
    throw new Error(`${this.name}.complete() not implemented`);
  }

  async *stream(messages, options = {}) {
    throw new Error(`${this.name}.stream() not implemented`);
  }

  async ping() {
    throw new Error(`${this.name}.ping() not implemented`);
  }
}

export class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigError';
    this.exitCode = 2;
  }
}

export class IntentParseError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = 'IntentParseError';
    this.exitCode = 5;
    this.context = context;
  }
}

export class ValidationError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = 'ValidationError';
    this.exitCode = 4;
    this.context = context;
  }
}

export class ResolverError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = 'ResolverError';
    this.exitCode = 1;
    this.context = context;
  }
}