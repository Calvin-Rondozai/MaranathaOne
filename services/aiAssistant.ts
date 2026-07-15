import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { SQLiteDatabase } from 'expo-sqlite';
import { hasModel } from './aiModel';
import { answerFromContext } from './llm';
import { ensureSearchIndexBuilt, searchContent } from '@/database/searchIndex';

// llama.rn is a native module — Expo Go (StoreClient) can never load it, only a
// development build can. Same check services/notifications.ts uses for its own
// native-module feature.
export const AI_INFERENCE_AVAILABLE = Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

export type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string };

// Fewer excerpts means a shorter prompt, which means less time spent on prefill before
// the first token even starts streaming — 4 is still enough context for most questions.
const SEARCH_RESULT_LIMIT = 4;

export type AssistantCallbacks = {
  onToken?: (partialText: string) => void; // live text of whichever section is currently generating
  onSection?: (sectionText: string) => void; // fires once per finished section — push each as its own chat message
};

// A long answer arrives as more than one call to onSection (see answerFromContext's
// continuation loop) rather than one long wait for a single giant reply — the caller
// treats each as a separate chat bubble.
export async function askAssistant(question: string, db: SQLiteDatabase, callbacks?: AssistantCallbacks): Promise<void> {
  if (!AI_INFERENCE_AVAILABLE) {
    callbacks?.onSection?.("AI answers aren't available in Expo Go — this needs a development build with the on-device model wired up.");
    return;
  }
  if (!hasModel()) {
    callbacks?.onSection?.('Download the AI model above first, then ask again.');
    return;
  }

  await ensureSearchIndexBuilt(db);
  const chunks = await searchContent(db, question, SEARCH_RESULT_LIMIT);
  const sourcesFooter = chunks.length ? `Sources:\n${chunks.map((c, i) => `[${i + 1}] ${c.title}`).join('\n')}` : '';

  await answerFromContext(question, chunks, {
    onToken: callbacks?.onToken,
    onSection: (sectionText, isLast) => {
      const text = isLast && sourcesFooter ? `${sectionText}\n\n${sourcesFooter}` : sectionText;
      callbacks?.onSection?.(text);
    },
  });
}
