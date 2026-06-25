/**
 * Local ID generation for the read-only request. Values satisfy the contract
 * `idSchema` (1-128 chars, /^[A-Za-z0-9._:-]+$/). No server, no MCP.
 */
function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Deterministic-enough fallback for non-crypto runtimes (tests/SSR).
  return Math.abs(Date.now() ^ (performance?.now?.() ?? 0))
    .toString(36)
    .padStart(8, "0");
}

export function generateSessionId(): string {
  return `session-${randomId()}`;
}

export function generateRequestId(): string {
  return `request-${randomId()}`;
}
