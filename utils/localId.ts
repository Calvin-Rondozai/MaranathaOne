// A client-only unique-enough id for locally-created list items (chat messages,
// checklist rows) — not a stored/synced identifier, so timestamp + random suffix is
// plenty. React Native has no built-in crypto.randomUUID() without adding expo-crypto.
export const newLocalId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
