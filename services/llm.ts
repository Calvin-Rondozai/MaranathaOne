import { Platform } from 'react-native';
import type { initLlama as InitLlama, LlamaContext, RNLlamaOAICompatibleMessage, TokenData } from 'llama.rn';
import { getModelPath } from './aiModel';
import type { SearchChunk } from '@/database/searchIndex';

let contextPromise: Promise<LlamaContext> | null = null;

// One shared context for the app's lifetime — reloading an ~800MB model on every
// question would make each answer as slow as the first. Cleared on failure so a later
// retry doesn't get stuck reusing a broken load. The require() is deferred to first
// call (never a static top-level import) — aiAssistant.ts only reaches this after its
// AI_INFERENCE_AVAILABLE check, matching how services/notifications.ts avoids ever
// loading a native module's JS in Expo Go, where merely requiring one can crash the app.
function getContext(): Promise<LlamaContext> {
  if (!contextPromise) {
    const { initLlama }: { initLlama: typeof InitLlama } = require('llama.rn');
    contextPromise = initLlama({
      model: getModelPath(),
      n_ctx: 4096,
      n_threads: 4,
      // GPU (VRAM) offload is only wired up for iOS/Metal in this llama.rn build —
      // Android falls back to CPU regardless of this value, so only set it where it
      // actually does something.
      ...(Platform.OS === 'ios' ? { n_gpu_layers: 99 } : {}),
    }).catch((err: unknown) => {
      contextPromise = null;
      throw err;
    });
  }
  return contextPromise;
}

const SYSTEM_PROMPT = `You are Hello C, an offline Bible study assistant inside the AdventCompass app.
Answer ONLY using the numbered excerpts given with the question — they come from the Bible, Ellen G.
White's writings, the SDA Bible Commentary, hymnals, and devotionals already in the app. Cite excerpts
you use like [1] or [2]. If the excerpts don't answer the question, say plainly that the app's content
doesn't cover it — never invent an answer from outside knowledge.`;

// Caps how long a single section takes to generate — the real lever on response time.
// A longer answer isn't lost, it just arrives as more sections (see MAX_SECTIONS below)
// instead of one long wait.
const MAX_RESPONSE_TOKENS = 256;

// If a section gets cut off by MAX_RESPONSE_TOKENS rather than finishing naturally, we
// ask the model to continue as a fresh turn and deliver the continuation as its own
// section/message. Capped so a rambling answer can't turn into an unbounded stream of
// chat bubbles.
const MAX_SECTIONS = 3;

export type SectionCallbacks = {
  onToken?: (partialText: string) => void; // live text of whichever section is currently generating
  onSection?: (sectionText: string, isLast: boolean) => void; // fires once per finished section
};

export async function answerFromContext(question: string, chunks: SearchChunk[], callbacks?: SectionCallbacks): Promise<string> {
  const context = await getContext();

  const excerpts = chunks.map((c, i) => `[${i + 1}] (${c.title}) ${c.text}`).join('\n\n');
  const basePrompt = chunks.length
    ? `Excerpts:\n${excerpts}\n\nQuestion: ${question}`
    : `Question: ${question}\n\n(No matching excerpts were found in the app's content.)`;

  const messages: RNLlamaOAICompatibleMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: basePrompt },
  ];

  const sections: string[] = [];
  for (let i = 0; i < MAX_SECTIONS; i++) {
    let accumulated = '';
    const result = await context.completion(
      { messages, n_predict: MAX_RESPONSE_TOKENS, temperature: 0.4 },
      callbacks?.onToken
        ? (data: TokenData) => {
            accumulated += data.token;
            callbacks.onToken!(accumulated);
          }
        : undefined
    );

    const sectionText = result.text.trim();
    sections.push(sectionText);
    const cutOffByLimit = !!result.stopped_limit && !result.stopped_eos;
    const isLast = !cutOffByLimit || i === MAX_SECTIONS - 1;
    callbacks?.onSection?.(sectionText, isLast);
    if (isLast) break;

    messages.push({ role: 'assistant', content: sectionText });
    messages.push({ role: 'user', content: 'Continue your answer from exactly where you left off — do not repeat anything or restart.' });
  }

  return sections.join('\n\n');
}
