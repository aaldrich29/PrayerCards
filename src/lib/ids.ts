/** Generate a stable, collision-resistant id. Uses crypto.randomUUID when available. */
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for very old environments / tests.
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}
