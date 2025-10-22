# Testing Guide: Anthropic-OpenAI Proxy Server

This guide explains how to test and use the proxy server with comprehensive logging.

## Prerequisites

1. **Node.js 18+** installed
2. **GLM-4.5-Air API Token** in `.env` file
3. **Dependencies installed**: `npm install`

## Quick Start

### 1. Start the Proxy Server

**Normal mode** (minimal logging):
```bash
npm run proxy
```

**Debug mode** (verbose logging with all details):
```bash
npm run proxy:debug
```

### 2. Server Output

When you start the server, you'll see a banner like this:

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 Anthropic <-> OpenAI Proxy Server                       ║
║                                                               ║
║   Enables Claude Code to work with GLM-4.5-Air model        ║
║   via format conversion                                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

Configuration:
  Proxy Server:    http://localhost:3333
  Backend API:     https://llm.chutes.ai/v1/chat/completions
  Target Model:    zai-org/GLM-4.5-Air
  Debug Mode:      ENABLED / DISABLED

Endpoints:
  GET  /              Health check
  GET  /v1/models     List available models
  POST /v1/messages   Main proxy endpoint (Anthropic format)

To use with Claude Code:
  export ANTHROPIC_AUTH_TOKEN="dummy"
  export ANTHROPIC_BASE_URL="http://localhost:3333"
  claude

Environment Variables:
  GLM_API_TOKEN     ✓ Set
  GLM_API_URL       ✓ Set
  GLM_MODEL         ✓ Set
  PORT               ✓ Set
  DEBUG              ✓ Enabled/Disabled

Logs:
  📥 Blue    = Incoming requests
  🔄 Magenta = Format conversions
  📤 Cyan    = Outgoing to GLM-4.5-Air
  ✅ Green   = Success
  ❌ Red     = Errors
  🌊 Cyan    = Streaming

✨ Server ready! Waiting for requests...
```

## Understanding the Logs

### Log Levels

The proxy uses color-coded logs for easy identification:

- **📥 BLUE** - Incoming requests from Claude Code
- **🔄 MAGENTA** - Format conversion operations
- **📤 CYAN** - Requests forwarded to GLM-4.5-Air API
- **✅ GREEN** - Successful operations
- **❌ RED** - Errors
- **⚠️ YELLOW** - Warnings
- **🌊 CYAN** - Streaming responses

### Log Examples

#### 1. Incoming Request (Always Shown)
```
================================================================================
[2025-10-17T12:34:56.789Z] [INFO] 📥 Incoming Request: POST /v1/messages
================================================================================
```

#### 2. Format Conversion (Debug Mode Only)
```
[2025-10-17T12:34:56.790Z] [DEBUG] 🔄 Format Conversion → TO-OPENAI
Input:
{
  "model": "claude-3-5-sonnet-20241022",
  "messages": [...],
  "tools": [...]
}
Output:
{
  "model": "zai-org/GLM-4.5-Air",
  "messages": [...],
  "tools": [...]
}
```

#### 3. GLM-4.5-Air API Call
```
[2025-10-17T12:34:56.791Z] [INFO] 📤 Forwarding to GLM-4.5-Air: https://llm.chutes.ai/v1/chat/completions
```

#### 4. GLM-4.5-Air Response
```
[2025-10-17T12:34:57.123Z] [SUCCESS] ✅ GLM-4.5-Air Response: 200
```

#### 5. Final Response
```
[2025-10-17T12:34:57.124Z] [SUCCESS] 📤 Sending Final Response to Claude Code
```

### Debug Mode vs Normal Mode

**Normal Mode** (`npm run proxy`):
- Shows request/response flow
- Indicates success/failure
- Minimal output for clean logs

**Debug Mode** (`npm run proxy:debug`):
- Shows EVERYTHING
- Full request/response bodies
- Detailed conversion steps
- Headers and metadata
- Streaming chunk content

## Testing Scenarios

### Test 1: Health Check

```bash
curl http://localhost:3333
```

**Expected Response:**
```json
{
  "status": "OK",
  "service": "Anthropic <-> OpenAI Proxy for Chutes GLM",
  "backend": "https://llm.chutes.ai/v1/chat/completions",
  "model": "zai-org/GLM-4.5-Air",
  "version": "1.0.0"
}
```

**Logs:**
```
[2025-10-17T...] [INFO] Health check requested
```

### Test 2: Models List

```bash
curl http://localhost:3333/v1/models
```

**Expected Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "claude-3-5-sonnet-20241022",
      "object": "model",
      "created": 1697545200,
      "owned_by": "anthropic"
    },
    ...
  ]
}
```

**Logs:**
```
[2025-10-17T...] [INFO] Models list requested
```

### Test 3: Simple Message (No Tools)

Create a test file `test-simple-message.sh`:

```bash
#!/bin/bash

curl -X POST http://localhost:3333/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: dummy" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 100,
    "messages": [
      {
        "role": "user",
        "content": "Say hello!"
      }
    ]
  }'
```

**Expected Logs (Normal Mode):**
```
================================================================================
[...] [INFO] 📥 Incoming Request: POST /v1/messages
================================================================================
[...] [INFO] 🔄 Converting Anthropic format to OpenAI format
[...] [INFO] 📤 Forwarding to Chutes: https://llm.chutes.ai/v1/chat/completions
[...] [SUCCESS] ✅ Chutes Response: 200
[...] [INFO] 📄 Non-streaming response
[...] [INFO] 🔄 Converting OpenAI format to Anthropic format
[...] [SUCCESS] 📤 Sending Final Response to Claude Code
```

**Expected Logs (Debug Mode):**
All of the above PLUS:
- Full request headers
- Full request body
- Complete conversion details (input/output)
- Full Chutes request payload
- Full Chutes response data
- Complete final response


### Test 4: Using with Claude Code

1. **Start proxy** (in one terminal):
```bash
npm run proxy:debug
```

2. **Configure Claude Code** (in another terminal):
```bash
export ANTHROPIC_AUTH_TOKEN="dummy"
export ANTHROPIC_BASE_URL="http://localhost:3333"
```

3. **Run Claude Code**:
```bash
claude
```

Now you can use Claude Code normally with the GLM-4.5-Air model!

## Debug Mode vs Normal Mode

