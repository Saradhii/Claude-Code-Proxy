# TypeScript Support

This package now includes full TypeScript type definitions for enhanced development experience.

## Installation

```bash
npm install codex-proxy
# or
yarn add codex-proxy
# or
pnpm add codex-proxy
```

## TypeScript Usage

### Basic Usage

```typescript
import { anthropicToOpenAI, openAIToAnthropic } from 'codex-proxy';
import type { AnthropicRequest, OpenAIResponse } from 'codex-proxy';

// Convert Anthropic request to OpenAI format
const anthropicRequest: AnthropicRequest = {
  model: 'claude-3-sonnet-20240229',
  messages: [
    { role: 'user', content: 'Hello, world!' }
  ],
  max_tokens: 1000,
  temperature: 0.7
};

const openAIRequest = anthropicToOpenAI(anthropicRequest);
console.log('OpenAI format:', openAIRequest);
```

### Advanced Usage with Custom Types

```typescript
import {
  anthropicToOpenAI,
  openAIToAnthropic,
  openAIStreamToAnthropic,
  type AnthropicRequest,
  type OpenAIResponse,
  type AnthropicStreamEvent,
  type AnthropicTool
} from 'codex-proxy';

// Define custom tools
const tools: AnthropicTool[] = [
  {
    name: 'get_weather',
    description: 'Get weather information for a location',
    input_schema: {
      type: 'object',
      properties: {
        location: { type: 'string' },
        unit: { type: 'string', enum: ['celsius', 'fahrenheit'] }
      },
      required: ['location']
    }
  }
];

// Create request with tools
const requestWithTools: AnthropicRequest = {
  model: 'claude-3-sonnet-20240229',
  messages: [
    { role: 'user', content: 'What\'s the weather in Tokyo?' }
  ],
  tools,
  tool_choice: 'auto',
  max_tokens: 1000
};

// Convert and use
const converted = anthropicToOpenAI(requestWithTools);
```

### Streaming Support

```typescript
import { openAIStreamToAnthropic } from 'codex-proxy';
import type { OpenAIStreamResponse, AnthropicStreamEvent } from 'codex-proxy';

// Handle streaming responses
function handleStreamChunk(openAIChunk: OpenAIStreamResponse): AnthropicStreamEvent | null {
  return openAIStreamToAnthropic(openAIChunk);
}
```

## Available Types

The package exports comprehensive type definitions for:

- **Anthropic API Types**: `AnthropicRequest`, `AnthropicResponse`, `AnthropicContentBlock`, etc.
- **OpenAI API Types**: `OpenAIRequest`, `OpenAIResponse`, `OpenAIMessage`, etc.
- **Proxy Types**: `ProxyConfig`, `LogLevel`, `Colors`, etc.

All types are available from the main package entry point:

```typescript
import type {
  // Anthropic types
  AnthropicRequest,
  AnthropicResponse,
  AnthropicMessage,
  AnthropicTool,

  // OpenAI types
  OpenAIRequest,
  OpenAIResponse,
  OpenAIMessage,
  OpenAITool,

  // Proxy types
  ProxyConfig,
  LogLevel
} from 'codex-proxy';
```

## Configuration Types

When configuring the proxy, you can use the defined types for better type safety:

```typescript
import type { ProxyConfig } from 'codex-proxy';

const config: ProxyConfig = {
  chutesApiToken: 'your-token',
  chutesApiUrl: 'https://api.example.com/v1/chat/completions',
  chutesModel: 'gpt-4',
  port: 3333,
  debug: true
};
```

## Strict TypeScript Configuration

For the best experience, use strict mode in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

## Development

If you want to contribute or modify the types:

```bash
# Clone repository
git clone https://github.com/Saradhii/Claude-Code-Proxy.git
cd Claude-Code-Proxy

# Install dependencies
npm install

# Run type checking
npm run type-check

# Build
npm run build
```

## IDE Support

The TypeScript definitions provide full IntelliSense support in:
- Visual Studio Code
- WebStorm
- Sublime Text with TypeScript plugin
- Vim/Neovim with TypeScript LSP
- Emacs with typescript-mode

## Type Safety Benefits

Using TypeScript provides:
- Compile-time error detection
- Auto-completion for all API methods
- Type checking for request/response formats
- Better refactoring support
- Self-documenting code through interfaces