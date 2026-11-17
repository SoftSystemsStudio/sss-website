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

type Message = Anthropic.Messages.Message;
// The request body without a `stream` flag; `messages.stream()` adds it. Streaming keeps a
// long researcher turn clear of HTTP timeouts.
type StreamParams = Anthropic.Messages.MessageCreateParamsNonStreaming;

/** The slice of the SDK this module uses, so tests can pass a fake without the network. */
export interface MessagesStreamer {
  stream(body: StreamParams): { finalMessage(): Promise<Message> };
}

const MAX_TOKENS = 32_000;
/** Per HTTP attempt; the SDK retries 408/409/429/5xx and connection errors on top. */
const REQUEST_TIMEOUT_MS = 10 * 60_000;
const MAX_RETRIES = 3;
/** Server-tool turns can pause; resume at most this many times. */
const MAX_CONTINUATIONS = 3;
/** Small cap so one run cannot spiral into dozens of searches: 6 candidates x at most 2 searches. */
export const WEB_SEARCH_MAX_USES = 12;

/**
 * The only tool any call ever gets, and only when `webSearch` is set. No
 * client-side tools, no bash, no fetch, no code execution: the model can read
 * search results and nothing else. This is the basic variant on purpose: the
 * newer web_search_20260209 does its dynamic filtering with server-side code
 * execution, and model calls here get no code execution at all. Re-check this
 * type string against the claude-api skill when the SDK is upgraded.
 */
const WEB_SEARCH_TOOL: Anthropic.Messages.WebSearchTool20250305 = {
  type: 'web_search_20250305',
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

/** Where usage lines go. Stderr by default, so stdout keeps only the outcome line. */
export type UsageLogger = (line: string) => void;
const stderrLogger: UsageLogger = (line) =>
  process.stderr.write(`${line}
`);

/**
 * One line per API call for cost visibility: role, model id and the token counts from
 * `usage`. Never prompts, outputs, URLs or keys.
 */
function usageLine(
  role: ModelRole,
  model: string,
  usage: Message['usage'] | undefined,
  stop: Message['stop_reason'],
): string {
  const parts = [`blog model call: role=${role}`, `model=${model}`];
  // A pause_turn continuation is a second line for the same call, not a retry.
  if (typeof stop === 'string' && /^[a-z_]{1,40}$/.test(stop)) parts.push(`stop=${stop}`);
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
  const fields: [string, number | undefined][] = [
    ['input', num(usage?.input_tokens)],
    ['output', num(usage?.output_tokens)],
    ['cache_read', num(usage?.cache_read_input_tokens)],
    ['cache_creation', num(usage?.cache_creation_input_tokens)],
    ['web_search_requests', num(usage?.server_tool_use?.web_search_requests)],
  ];
  for (const [k, v] of fields) if (v !== undefined) parts.push(`${k}=${v}`);
  return parts.join(' ');
}

export function createCallModelWithClient(
  messages: MessagesStreamer,
  logUsage: UsageLogger = stderrLogger,
): CallModel {
  return async ({ role, system, user, webSearch }) => {
    const history: Anthropic.Messages.MessageParam[] = [{ role: 'user', content: user }];
    const texts: string[] = [];
    for (let turn = 0; turn <= MAX_CONTINUATIONS; turn++) {
      const params: StreamParams = {
        model: MODELS[role],
        max_tokens: MAX_TOKENS,
        system,
        messages: history,
        output_config: { effort: 'high' },
        ...(webSearch ? { tools: [WEB_SEARCH_TOOL] } : {}),
      };
      const msg = await messages.stream(params).finalMessage();
      logUsage(usageLine(role, params.model, msg.usage, msg.stop_reason));
      for (const block of msg.content) if (block.type === 'text') texts.push(block.text);

      if (msg.stop_reason === 'pause_turn') {
        // A long server-tool turn paused; send it back so the server resumes it. Its text
        // is kept: the resumed turn only adds new blocks, so dropping it could cut an
        // answer that began before the pause (extractJson skips any prose around it).
        history.push({ role: 'assistant', content: msg.content });
        continue;
      }
      if (msg.stop_reason === 'end_turn' || msg.stop_reason === 'stop_sequence') {
        return texts.join('');
      }
      // A refusal fails hard (no fallback model), as do max_tokens (truncated) and anything
      // unexpected: the orchestrator logs the error and opens no PR.
      throw new Error(`${role} model stopped with stop_reason=${msg.stop_reason}`);
    }
    throw new Error(`${role} model still paused after ${MAX_CONTINUATIONS} continuations`);
  };
}

/** A CallModel backed by the Anthropic API. Never logs the key or the prompts. */
export function createAnthropicCallModel(apiKey: string): CallModel {
  const client = new Anthropic({ apiKey, timeout: REQUEST_TIMEOUT_MS, maxRetries: MAX_RETRIES });
  return createCallModelWithClient(client.messages);
}
