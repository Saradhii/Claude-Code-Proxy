/**
 * Format Converter: Anthropic <-> OpenAI
 * Handles bidirectional conversion between Anthropic Messages API and OpenAI Chat Completions API
 */

import {
  AnthropicRequest,
  AnthropicResponse,
  AnthropicMessage,
  AnthropicContentBlock,
  AnthropicTool,
  AnthropicToolChoice,
  AnthropicToolUseContentBlock,
  AnthropicToolResultContentBlock,
  AnthropicTextContentBlock,
  AnthropicImageContentBlock,
  AnthropicStreamEvent,
} from './types/anthropic.js';
import {
  OpenAIRequest,
  OpenAIResponse,
  OpenAIMessage,
  OpenAITool,
  OpenAIToolChoice,
  OpenAIStreamResponse,
} from './types/openai.js';

/**
 * Convert Anthropic request to OpenAI format
 */
export function anthropicToOpenAI(anthropicRequest: AnthropicRequest): OpenAIRequest {
  const {
    model,
    messages,
    max_tokens,
    temperature,
    top_p,
    stop_sequences,
    stream,
    system,
    tools,
    tool_choice
  } = anthropicRequest;

  // Convert messages
  const openAIMessages: OpenAIMessage[] = [];

  // Add system message if present
  if (system) {
    // System can be a string or array of content blocks
    const systemContent = typeof system === 'string'
      ? system
      : system.map(block => block.text || '').join('\n');

    openAIMessages.push({
      role: 'system',
      content: systemContent
    });
  }

  // Convert messages
  for (const msg of messages) {
    const openAIMessage = convertAnthropicMessage(msg);
    if (openAIMessage) {
      openAIMessages.push(openAIMessage);
    }
  }

  // Build OpenAI request
  const openAIRequest: OpenAIRequest = {
    model: model || 'gpt-4',
    messages: openAIMessages,
    stream: stream || false
  };

  // Optional parameters
  if (max_tokens) openAIRequest.max_tokens = max_tokens;
  if (temperature !== undefined) openAIRequest.temperature = temperature;
  if (top_p !== undefined) openAIRequest.top_p = top_p;
  if (stop_sequences) openAIRequest.stop = stop_sequences;

  // Convert tools
  if (tools && tools.length > 0) {
    openAIRequest.tools = tools.map(convertAnthropicTool);
  }

  // Convert tool_choice
  if (tool_choice) {
    openAIRequest.tool_choice = convertAnthropicToolChoice(tool_choice);
  }

  return openAIRequest;
}

/**
 * Convert Anthropic message to OpenAI message
 */
function convertAnthropicMessage(anthropicMsg: AnthropicMessage): OpenAIMessage | null {
  const { role, content } = anthropicMsg;

  // Handle string content
  if (typeof content === 'string') {
    return { role, content };
  }

  // Handle array of content blocks
  if (Array.isArray(content)) {
    // Check if there are tool_use blocks
    const toolUseBlocks = content.filter(
      (block): block is AnthropicToolUseContentBlock => block.type === 'tool_use'
    );
    const toolResultBlocks = content.filter(
      (block): block is AnthropicToolResultContentBlock => block.type === 'tool_result'
    );
    const textBlocks = content.filter(
      (block): block is AnthropicTextContentBlock => block.type === 'text'
    );
    const imageBlocks = content.filter(
      (block): block is AnthropicImageContentBlock => block.type === 'image'
    );

    // If it's a tool result message (user role with tool_result)
    if (role === 'user' && toolResultBlocks.length > 0) {
      return {
        role: 'tool',
        tool_call_id: toolResultBlocks[0].tool_use_id,
        content: typeof toolResultBlocks[0].content === 'string'
          ? toolResultBlocks[0].content
          : JSON.stringify(toolResultBlocks[0].content)
      };
    }

    // If it's an assistant message with tool_use
    if (role === 'assistant' && toolUseBlocks.length > 0) {
      const message: OpenAIMessage = {
        role: 'assistant',
        content: textBlocks.map(b => b.text).join('') || ''
      };

      message.tool_calls = toolUseBlocks.map((block) => ({
        id: block.id,
        type: 'function',
        function: {
          name: block.name,
          arguments: JSON.stringify(block.input)
        }
      }));

      return message;
    }

    // Regular text/image message
    if (imageBlocks.length > 0) {
      // OpenAI format for images
      return {
        role,
        content: [
          ...textBlocks.map(b => ({ type: 'text' as const, text: b.text })),
          ...imageBlocks.map(b => ({
            type: 'image_url' as const,
            image_url: {
              url: b.source.type === 'base64'
                ? `data:${b.source.media_type};base64,${b.source.data}`
                : b.source.url
            }
          }))
        ]
      };
    }

    // Just text blocks
    return {
      role,
      content: textBlocks.map(b => b.text).join('')
    };
  }

  return { role, content };
}

/**
 * Convert Anthropic tool to OpenAI tool
 */
function convertAnthropicTool(anthropicTool: AnthropicTool): OpenAITool {
  return {
    type: 'function',
    function: {
      name: anthropicTool.name,
      description: anthropicTool.description,
      parameters: anthropicTool.input_schema
    }
  };
}

/**
 * Convert Anthropic tool_choice to OpenAI tool_choice
 */
function convertAnthropicToolChoice(anthropicToolChoice: AnthropicToolChoice): OpenAIToolChoice {
  if (typeof anthropicToolChoice === 'string') {
    // "auto", "any", "none"
    if (anthropicToolChoice === 'any') return 'required';
    if (anthropicToolChoice === 'none') return 'none';
    return 'auto';
  }

  if (anthropicToolChoice.type === 'tool') {
    return {
      type: 'function',
      function: { name: anthropicToolChoice.name }
    };
  }

  return 'auto';
}

/**
 * Convert OpenAI response to Anthropic format
 */
export function openAIToAnthropic(openAIResponse: OpenAIResponse): AnthropicResponse {
  const { id, model, choices, usage } = openAIResponse;

  const choice = choices[0];
  const message = choice.message;

  // Build content blocks
  const content: AnthropicContentBlock[] = [];

  // Add text content
  if (message.content) {
    content.push({
      type: 'text',
      text: message.content
    });
  }

  // Add reasoning_content if present (GLM-specific field)
  if (message.reasoning_content && !message.content) {
    content.push({
      type: 'text',
      text: message.reasoning_content
    });
  }

  // Add tool_use blocks
  if (message.tool_calls && message.tool_calls.length > 0) {
    for (const toolCall of message.tool_calls) {
      content.push({
        type: 'tool_use',
        id: toolCall.id,
        name: toolCall.function.name,
        input: JSON.parse(toolCall.function.arguments)
      });
    }
  }

  // Determine stop_reason
  let stop_reason: AnthropicResponse['stop_reason'] = 'end_turn';
  if (choice.finish_reason === 'tool_calls') {
    stop_reason = 'tool_use';
  } else if (choice.finish_reason === 'length') {
    stop_reason = 'max_tokens';
  } else if (choice.finish_reason === 'stop') {
    stop_reason = 'end_turn';
  }

  return {
    id: id || `msg_${Date.now()}`,
    type: 'message',
    role: 'assistant',
    content,
    model: model,
    stop_reason: stop_reason,
    stop_sequence: null,
    usage: {
      input_tokens: usage?.prompt_tokens || 0,
      output_tokens: usage?.completion_tokens || 0
    }
  };
}

/**
 * Convert OpenAI streaming chunk to Anthropic streaming format
 */
export function openAIStreamToAnthropic(openAIChunk: OpenAIStreamResponse): AnthropicStreamEvent | null {
  const { id, model, choices } = openAIChunk;

  if (!choices || choices.length === 0) {
    return null;
  }

  const delta = choices[0].delta;
  const finish_reason = choices[0].finish_reason;

  // Start event
  if (!delta.content && !delta.tool_calls) {
    const startEvent: AnthropicStreamEvent = {
      type: 'message_start',
      message: {
        id: id || `msg_${Date.now()}`,
        type: 'message',
        role: 'assistant',
        content: [],
        model: model,
        stop_reason: null,
        stop_sequence: null,
        usage: { input_tokens: 0, output_tokens: 0 }
      }
    };
    return startEvent;
  }

  // Content delta
  if (delta.content) {
    return {
      type: 'content_block_delta',
      index: 0,
      delta: {
        type: 'text_delta',
        text: delta.content
      }
    };
  }

  // Tool call delta
  if (delta.tool_calls) {
    const toolCall = delta.tool_calls[0];
    const deltaData: any = {
      type: 'tool_use_delta' as const
    };

    if (toolCall.id !== undefined) deltaData.id = toolCall.id;
    if (toolCall.function?.name !== undefined) deltaData.name = toolCall.function.name;
    if (toolCall.function?.arguments !== undefined) deltaData.input = toolCall.function.arguments;

    return {
      type: 'content_block_delta',
      index: 0,
      delta: deltaData
    };
  }

  // Finish event
  if (finish_reason) {
    let stop_reason: AnthropicResponse['stop_reason'] = 'end_turn';
    if (finish_reason === 'tool_calls') stop_reason = 'tool_use';
    else if (finish_reason === 'length') stop_reason = 'max_tokens';

    return {
      type: 'message_delta',
      delta: { stop_reason, stop_sequence: null },
      usage: { output_tokens: 1 }
    };
  }

  return null;
}