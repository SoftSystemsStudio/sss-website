import Anthropic from '@anthropic-ai/sdk';
import { MODELS } from './config';

export type ModelRole = 'researcher' | 'writer' | 'reviewer';

export interface ModelRequest {
  role: ModelRole;
  system: string;
  user: string;
  /** Enables the server-side web search tool. Only the researcher uses it. */
  webSearch?: boolean;
}

/** One model call: returns the reply's text blocks, concatenated. */
export type CallModel = (req: ModelRequest) => Promise<string>;

type BetaMessage = Anthropic.Beta.Messages.BetaMessage;
// The request body without a `stream` flag; `messages.stream()` adds it. Streaming keeps a
// long researcher turn clear of HTTP timeouts.
type StreamParams = Anthropic.Beta.Messages.MessageCreateParamsNonStreaming;

/** The slice of the SDK this module uses, so tests can pass a fake without the network. */
export interface MessagesStreamer {
  stream(body: StreamParams): { finalMessage(): Promise<BetaMessage> };
}

const MAX_TOKENS = 32_000;
/** Per HTTP attempt; the SDK retries 408/409/429/5xx and connection errors on top. */
const REQUEST_TIMEOUT_MS = 10 * 60_000;
const MAX_RETRIES = 3;
/** Server-tool turns can pause; resume at most this many times. */
const MAX_CONTINUATIONS = 5;
const WEB_SEARCH_MAX_USES = 10;

/**
 * The only tool any call ever gets, and only when `webSearch` is set. No
 * client-side tools, no bash, no fetch, no code execution: the model can read
 * search results and nothing else.
 */
const WEB_SEARCH_TOOL: Anthropic.Beta.Messages.BetaWebSearchTool20260209 = {
  type: 'web_search_20260209',
  name: 'web_search',
  max_uses: WEB_SEARCH_MAX_USES,
  user_location: {
    type: 'approximate',
    city: 'Columbus',
    region: 'Georgia',
    country: 'US',
    timezone: 'America/New_York',
  },
};

export function createCallModelWithClient(messages: MessagesStreamer): CallModel {
  return async ({ role, system, user, webSearch }) => {
    const history: Anthropic.Beta.Messages.BetaMessageParam[] = [{ role: 'user', content: user }];
    const texts: string[] = [];
    for (let turn = 0; turn <= MAX_CONTINUATIONS; turn++) {
      const params: StreamParams = {
        model: MODELS[role],
        max_tokens: MAX_TOKENS,
        system,
        messages: history,
        output_config: { effort: 'high' },
        // On a safety decline the API reruns the request on a fallback model
        // chosen by refusal category, inside the same call.
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        ...(webSearch ? { tools: [WEB_SEARCH_TOOL] } : {}),
      };
      const msg = await messages.stream(params).finalMessage();
      for (const block of msg.content) if (block.type === 'text') texts.push(block.text);

      if (msg.stop_reason === 'pause_turn') {
        // A long server-tool turn paused; send it back so the server resumes it.
        history.push({ role: 'assistant', content: msg.content });
        texts.length = 0;
        continue;
      }
      if (msg.stop_reason === 'end_turn' || msg.stop_reason === 'stop_sequence') {
        return texts.join('');
      }
      // refusal, max_tokens (truncated), or anything unexpected: fail the stage.
      throw new Error(`${role} model stopped with stop_reason=${msg.stop_reason}`);
    }
    throw new Error(`${role} model still paused after ${MAX_CONTINUATIONS} continuations`);
  };
}

/** A CallModel backed by the Anthropic API. Never logs the key or the prompts. */
export function createAnthropicCallModel(apiKey: string): CallModel {
  const client = new Anthropic({ apiKey, timeout: REQUEST_TIMEOUT_MS, maxRetries: MAX_RETRIES });
  return createCallModelWithClient(client.beta.messages);
}
