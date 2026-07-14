// Flips to true once llama.rn is added as a dependency and wired up in a dev-client
// build — Expo Go can never run it (native module), so this stays a plain constant
// rather than a runtime capability check like notificationsAvailable.
export const AI_INFERENCE_AVAILABLE = false;

export type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string };

// Placeholder until llama.rn + the RAG layer (SQLite search over Bible/EGW/Commentary
// content) are wired up. Keeps the chat screen fully functional and testable now.
export async function askAssistant(_question: string): Promise<string> {
  return "AI answers aren't available yet in Expo Go — this needs a development build with the on-device model wired up. Once that's ready, I'll answer using your downloaded Bible, EGW books, and Commentary, and say exactly where each answer came from.";
}
